import React, { useState, useRef } from 'react';

const LessonPanel = ({
  lessons = [],
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onRenameLesson,
  adding = false,
}) => {
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
    <aside
      className="flex flex-col bg-white overflow-hidden"
      style={{ width: 224, flexShrink: 0, borderRight: '1px solid #f0f0f0' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: '#fafbfc', borderBottom: '1px solid #f0f0f0' }}
      >
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5" style={{ color: '#aaa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#aaa' }}>
            Lessons
          </span>
        </div>

        <button
          onClick={onAddLesson}
          disabled={adding}
          title="Add lesson"
          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#aaa', transition: 'color 0.15s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#33a163'; e.currentTarget.style.background = 'rgba(51,161,99,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = 'transparent'; }}
        >
          {adding ? (
            <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '8px 8px 8px' }}>
        {lessons.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 12px', color: '#ccc', fontSize: 12 }}>
            <svg style={{ width: 32, height: 32, margin: '0 auto 8px', color: '#e0e0e0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            No lessons yet
          </div>
        )}

        {lessons.map((lesson, i) => {
          const isActive = selectedLessonId === lesson.id;
          const isEditing = editingId === lesson.id;

          return (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={i}
              isActive={isActive}
              isEditing={isEditing}
              editValue={editValue}
              inputRef={editingId === lesson.id ? inputRef : null}
              onSelect={() => !isEditing && onSelectLesson(lesson.id)}
              onStartEdit={(e) => startEdit(e, lesson)}
              onEditChange={(v) => setEditValue(v)}
              onCommit={commitEdit}
              onKeyDown={handleKeyDown}
            />
          );
        })}
      </div>

      {/* Footer */}
      {lessons.length > 0 && (
        <div
          className="flex-shrink-0 px-4 py-2"
          style={{ borderTop: '1px solid #f0f0f0', background: '#fafbfc' }}
        >
          <span style={{ fontSize: 10, color: '#ccc' }}>
            {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
          </span>
        </div>
      )}
    </aside>
  );
};

const LessonItem = ({
  lesson,
  index,
  isActive,
  isEditing,
  editValue,
  inputRef,
  onSelect,
  onStartEdit,
  onEditChange,
  onCommit,
  onKeyDown,
}) => {
  const [hovered, setHovered] = React.useState(false);

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    marginBottom: 2,
    transition: 'background 0.12s',
    background: isActive ? 'rgba(51,161,99,0.08)' : hovered ? '#f5f5f5' : 'transparent',
    borderLeft: isActive ? '2px solid #33a163' : '2px solid transparent',
  };

  const badgeStyle = {
    width: 18,
    height: 18,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
    transition: 'background 0.12s',
    background: isActive ? '#33a163' : '#eee',
    color: isActive ? '#fff' : '#888',
  };

  return (
    <div
      style={itemStyle}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isEditing ? undefined : 'Double-click to rename'}
    >
      <span style={badgeStyle}>{index + 1}</span>

      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            background: '#fff',
            border: '1px solid #33a163',
            borderRadius: 4,
            padding: '1px 6px',
            outline: 'none',
            color: '#222',
            boxShadow: '0 0 0 2px rgba(51,161,99,0.15)',
          }}
          autoFocus
        />
      ) : (
        <>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              color: isActive ? '#1e6e45' : '#555',
              fontWeight: isActive ? 550 : 450,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onDoubleClick={onStartEdit}
          >
            {lesson.title || `Lesson ${index + 1}`}
          </span>

          {hovered && (
            <button
              onClick={onStartEdit}
              title="Rename"
              style={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#bbb',
                flexShrink: 0,
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#33a163'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#bbb'; }}
            >
              <svg style={{ width: 11, height: 11 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default LessonPanel;
