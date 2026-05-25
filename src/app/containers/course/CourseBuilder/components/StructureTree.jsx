import React from 'react';
import { Icon, Button, Label } from 'semantic-ui-react';

const typeConfig = {
  section: { icon: 'folder', color: 'blue', label: 'Section' },
  module: { icon: 'cubes', color: 'teal', label: 'Module' },
  lesson: { icon: 'file alternate', color: 'green', label: 'Lesson' },
  topic: { icon: 'bookmark', color: 'grey', label: 'Topic' },
};

const lessonTypeIcons = {
  text: 'file text',
  video: 'video',
  audio: 'volume up',
  pdf: 'file pdf',
  quiz: 'question circle',
  assignment: 'edit',
};

const StructureTree = ({
  course,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onToggleCollapse,
}) => {
  if (!course || !course.sections || course.sections.length === 0) {
    return (
      <div className='structure-tree-empty'>
        <Icon name='sitemap' size='huge' color='grey' />
        <p>No content structure yet.</p>
        <p style={{ fontSize: 12, color: '#aaa' }}>Add a section to get started.</p>
        <Button primary size='small' onClick={() => onAdd('section', null)}>
          <Icon name='plus' /> Add Section
        </Button>
      </div>
    );
  }

  return (
    <div className='structure-tree'>
      {course.sections.map((section) => (
        <TreeNode
          key={section.id}
          node={section}
          type='section'
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          onToggleCollapse={onToggleCollapse}
        >
          {section.modules.map((mod) => (
            <TreeNode
              key={mod.id}
              node={mod}
              type='module'
              depth={1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
              onToggleCollapse={onToggleCollapse}
            >
              {mod.lessons.map((lesson) => (
                <TreeNode
                  key={lesson.id}
                  node={lesson}
                  type='lesson'
                  depth={2}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onAdd={onAdd}
                  onDelete={onDelete}
                  onToggleCollapse={onToggleCollapse}
                >
                  {lesson.topics.map((topic) => (
                    <TreeNode
                      key={topic.id}
                      node={topic}
                      type='topic'
                      depth={3}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      onAdd={onAdd}
                      onDelete={onDelete}
                      onToggleCollapse={onToggleCollapse}
                    />
                  ))}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </TreeNode>
      ))}
    </div>
  );
};

const TreeNode = ({
  node,
  type,
  depth,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onToggleCollapse,
  children,
}) => {
  const config = typeConfig[type];
  const isSelected = selectedId === node.id;
  const hasChildren = children && children.length > 0;
  const isCollapsed = node.isCollapsed;

  const handleClick = () => {
    onSelect(node, type);
    if (type === 'section' && hasChildren) {
      onToggleCollapse(node.id);
    }
  };

  const indentStyle = { paddingLeft: `${12 + depth * 20}px` };

  return (
    <div className={`tree-node ${isSelected ? 'selected' : ''}`}>
      <div
        className='tree-node-row'
        style={indentStyle}
        onClick={handleClick}
      >
        {/* Expand/collapse toggle */}
        {type === 'section' && (
          <span className='tree-node-toggle' onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.id); }}>
            <Icon name={isCollapsed ? 'chevron right' : 'chevron down'} size='small' />
          </span>
        )}
        {type !== 'section' && <span className='tree-node-spacer' />}

        {/* Icon */}
        <Icon
          name={type === 'lesson' ? (lessonTypeIcons[node.type] || 'file alternate') : config.icon}
          size='small'
          className='tree-node-icon'
          style={{ color: config.color === 'blue' ? '#2185d0' : config.color === 'teal' ? '#00b5ad' : config.color === 'green' ? '#33a163' : '#999' }}
        />

        {/* Title */}
        <span className='tree-node-title'>{node.title}</span>

        {/* Status badge */}
        {node.status === 'draft' && (
          <Label size='mini' color='grey' style={{ marginLeft: 4 }}>Draft</Label>
        )}
        {node.isLocked && (
          <Icon name='lock' size='mini' color='orange' style={{ marginLeft: 4 }} />
        )}

        {/* Actions */}
        <div className='tree-node-actions' onClick={(e) => e.stopPropagation()}>
          {/* Add child button */}
          {type === 'section' && (
            <Button icon size='mini' title='Add Module' onClick={() => onAdd('module', node.id)}>
              <Icon name='plus' />
            </Button>
          )}
          {type === 'module' && (
            <Button icon size='mini' title='Add Lesson' onClick={() => onAdd('lesson', node.id)}>
              <Icon name='plus' />
            </Button>
          )}
          {type === 'lesson' && (
            <Button icon size='mini' title='Add Topic' onClick={() => onAdd('topic', node.id)}>
              <Icon name='plus' />
            </Button>
          )}
          {/* Delete button */}
          <Button icon size='mini' color='red' title={`Delete ${config.label}`} onClick={() => onDelete(node.id, type)}>
            <Icon name='trash' />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div className='tree-node-children'>
          {children}
        </div>
      )}
    </div>
  );
};

export default StructureTree;
