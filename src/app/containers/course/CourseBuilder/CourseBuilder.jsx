import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider, Button, Header, Message } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import StructureTree from './components/StructureTree';
import NodeEditor from './components/NodeEditor';
import {
  mockFetchCourseStructure,
  mockCreateSection, mockUpdateSection, mockDeleteSection,
  mockCreateModule, mockUpdateModule, mockDeleteModule,
  mockCreateLesson, mockUpdateLesson, mockDeleteLesson,
  mockCreateTopic, mockUpdateTopic, mockDeleteTopic,
} from '@/app/services/courseBuilderService';
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

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mockFetchCourseStructure(id);
      setCourse(data);
    } catch (err) {
      setError('Failed to load course structure.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ─── Selection ───────────────────────────────────────────────
  const handleSelect = (node, type) => {
    setSelectedNode(node);
    setSelectedType(type);
  };

  // ─── Add ─────────────────────────────────────────────────────
  const handleAdd = async (type, parentId) => {
    if (!course) return;
    try {
      setSaving(true);
      let newNode;

      if (type === 'section') {
        newNode = await mockCreateSection(course.id, { title: 'New Section' });
      } else if (type === 'module') {
        newNode = await mockCreateModule(course.id, parentId, { title: 'New Module' });
      } else if (type === 'lesson') {
        newNode = await mockCreateLesson(course.id, parentId, { title: 'New Lesson' });
      } else if (type === 'topic') {
        newNode = await mockCreateTopic(course.id, parentId, { title: 'New Topic' });
      }

      await loadCourse();
      if (newNode) {
        setSelectedNode(newNode);
        setSelectedType(type);
      }
      showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────────
  const handleDelete = async (nodeId, type) => {
    if (!course) return;
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    if (!window.confirm(`Delete this ${label.toLowerCase()}? This cannot be undone.`)) return;

    try {
      setSaving(true);
      if (type === 'section') await mockDeleteSection(course.id, nodeId);
      else if (type === 'module') await mockDeleteModule(course.id, nodeId);
      else if (type === 'lesson') await mockDeleteLesson(course.id, nodeId);
      else if (type === 'topic') await mockDeleteTopic(course.id, selectedNode?.parentId || nodeId, nodeId);

      await loadCourse();
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
        setSelectedType(null);
      }
      showSuccess(`${label} deleted.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Save (from NodeEditor) ──────────────────────────────────
  const handleSave = async (formData) => {
    if (!selectedNode || !selectedType || !course) return;
    try {
      setSaving(true);
      const { id: nodeId } = selectedNode;

      if (selectedType === 'section') {
        await mockUpdateSection(course.id, nodeId, formData);
      } else if (selectedType === 'module') {
        await mockUpdateModule(course.id, nodeId, formData);
      } else if (selectedType === 'lesson') {
        await mockUpdateLesson(course.id, nodeId, formData);
      } else if (selectedType === 'topic') {
        // Find parent lesson id from the tree
        const parentLessonId = findParentLessonId(course, nodeId);
        if (parentLessonId) {
          await mockUpdateTopic(course.id, parentLessonId, nodeId, formData);
        }
      }

      await loadCourse();
      // Re-select the updated node
      showSuccess('Changes saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Collapse toggle ─────────────────────────────────────────
  const handleToggleCollapse = (sectionId) => {
    setCourse((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s
      )};
      return updated;
    });
  };

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <div className='dashboard-content'>
            <Segment loading><Header as='h2'>Loading course builder...</Header></Segment>
          </div>
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
            {/* Left: Structure Tree */}
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
                course={course}
                selectedId={selectedNode?.id}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onToggleCollapse={handleToggleCollapse}
              />
            </div>

            {/* Right: Node Editor */}
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

// Helper: find the parent lesson id of a topic
function findParentLessonId(course, topicId) {
  for (const section of course.sections || []) {
    for (const mod of section.modules || []) {
      for (const lesson of mod.lessons || []) {
        if (lesson.topics?.some((t) => t.id === topicId)) {
          return lesson.id;
        }
      }
    }
  }
  return null;
}

export default CourseBuilder;
