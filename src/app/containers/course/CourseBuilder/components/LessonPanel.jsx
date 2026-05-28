import React, { useState, useRef } from 'react';
import { Button, Icon } from 'semantic-ui-react';

const LessonPanel = ({ lessons = [], selectedLessonId, onSelectLesson, onAddLesson, onRenameLesson, adding = false }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  const startEdit = (e, lesson) => {
    e.stopPropagation();
    setEditingId(lesson.id);
    setEditValue(lesson.title || '');
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (editingId && onRenameLesson) {
      const trimmed = editValue.trim();
      if (trimmed) onRenameLesson(editingId, trimmed);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div className='lesson-panel'>
      <div className='lesson-panel-header'>
        <span className='lesson-panel-title'>Lessons</span>
        <Button size='mini' icon onClick={onAddLesson} loading={adding} title='Add lesson'>
          <Icon name='plus' />
        </Button>
      </div>

      <div className='lesson-panel-list'>
        {lessons.length === 0 && (
          <div className='lesson-panel-empty'>No lessons yet</div>
        )}
        {lessons.map((lesson, i) => (
          <div
            key={lesson.id}
            className={`lesson-panel-item${selectedLessonId === lesson.id ? ' active' : ''}`}
            onClick={() => editingId !== lesson.id && onSelectLesson(lesson.id)}
            title={editingId === lesson.id ? undefined : 'Double-click to rename'}
          >
            <span className='lesson-panel-num'>{i + 1}</span>
            {editingId === lesson.id ? (
              <input
                ref={inputRef}
                className='lesson-panel-rename-input'
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className='lesson-panel-name'
                onDoubleClick={(e) => startEdit(e, lesson)}
              >
                {lesson.title || `Lesson ${i + 1}`}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonPanel;
