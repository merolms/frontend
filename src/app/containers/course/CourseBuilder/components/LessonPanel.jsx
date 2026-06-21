import React, { useCallback, useRef, useState } from "react";

import { t } from "@/styles/theme";

const LessonPanel = ({
  lessons = [],
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onRenameLesson,
  onDeleteLesson,
  onReorder,
  onBulkDelete,
  onBulkDuplicate,
  adding = false,
  width = 300,
  isDragging = false,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const dragCounter = useRef(0);

  const startEdit = (e, lesson) => {
    e.stopPropagation();
    setEditingId(lesson.id);
    setEditValue(lesson.title || "");
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(lessons.map((l) => l.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size > 0 && onBulkDelete) {
      onBulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleBulkDuplicateClick = () => {
    if (selectedIds.size > 0 && onBulkDuplicate) {
      onBulkDuplicate(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const commitEdit = () => {
    if (editingId && onRenameLesson) {
      const trimmed = editValue.trim();
      if (trimmed) onRenameLesson(editingId, trimmed);
    }
    setEditingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingId(null);
  };

  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragEnter = useCallback(
    (index) => {
      dragCounter.current++;
      if (dragIndex !== null && index !== dragIndex) {
        setDropIndex(index);
      }
    },
    [dragIndex]
  );

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDropIndex(null);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e, targetIndex) => {
      e.preventDefault();
      dragCounter.current = 0;
      if (dragIndex === null || dragIndex === targetIndex) {
        setDragIndex(null);
        setDropIndex(null);
        return;
      }
      const newLessons = [...lessons];
      const [moved] = newLessons.splice(dragIndex, 1);
      newLessons.splice(targetIndex, 0, moved);
      onReorder?.(newLessons);
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex, lessons, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    dragCounter.current = 0;
    setDragIndex(null);
    setDropIndex(null);
  }, []);

  return (
    <aside
      className={`flex flex-col overflow-hidden ${isDragging ? "border-r-4 border-sky-300 " : "border-r-1 border-sky-100"}`}
      style={{
        width,
        flexShrink: 0,
        background: t("bg-sidebar"),
        borderRight: `1px solid ${t("border-primary")}`,
      }}
    >
      {/* Header */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-4 py-3"
        style={{ background: t("bg-secondary"), borderBottom: `1px solid ${t("border-primary")}` }}
      >
        <div className="flex items-center gap-2">
          {lessons.length > 0 && (
            <button
              onClick={() => handleSelectAll(selectedIds.size !== lessons.length)}
              title={selectedIds.size === lessons.length ? "Deselect all" : "Select all"}
              style={{
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 3,
                border: `1.5px solid ${selectedIds.size === lessons.length ? t("text-primary") : t("text-disabled")}`,
                background: selectedIds.size === lessons.length ? t("text-primary") : "transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {selectedIds.size === lessons.length && (
                <svg
                  style={{ width: 10, height: 10, color: t("bg-surface") }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>
          )}
          <div className="flex items-center gap-2">
            <svg
              className="h-3.5 w-3.5"
              style={{ color: t("text-muted") }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: t("text-muted"),
              }}
            >
              Lessons
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleBulkDuplicateClick}
                title="Duplicate selected"
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  border: "none",
                  background: t("bg-hover"),
                  cursor: "pointer",
                  color: t("text-muted"),
                  flexShrink: 0,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = t("text-primary");
                  e.currentTarget.style.background = t("bg-active");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = t("text-muted");
                  e.currentTarget.style.background = t("bg-hover");
                }}
              >
                <svg
                  style={{ width: 12, height: 12 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                  />
                </svg>
              </button>
              <button
                onClick={handleBulkDeleteClick}
                title="Delete selected"
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  border: "none",
                  background: t("error-light"),
                  cursor: "pointer",
                  color: t("error"),
                  flexShrink: 0,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = t("error");
                  e.currentTarget.style.color = t("bg-surface");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = t("error-light");
                  e.currentTarget.style.color = t("error");
                }}
              >
                <svg
                  style={{ width: 12, height: 12 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </>
          )}
          {onAddLesson && (
            <button
              onClick={onAddLesson}
              disabled={adding}
              title="Add lesson"
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: t("text-muted"),
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = t("text-primary");
                e.currentTarget.style.background = t("bg-hover");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = t("text-muted");
                e.currentTarget.style.background = "transparent";
              }}
            >
              {adding ? (
                <svg
                  style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx={12}
                    cy={12}
                    r={10}
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  style={{ width: 14, height: 14 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 8px 8px" }}>
        {lessons.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 12px",
              color: t("text-disabled"),
              fontSize: 12,
            }}
          >
            <svg
              style={{ width: 32, height: 32, margin: "0 auto 8px", color: t("border-secondary") }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            No lessons yet
          </div>
        )}

        {lessons.map((lesson, i) => {
          const isActive = selectedLessonId === lesson.id;
          const isEditing = editingId === lesson.id;
          const isDragging = dragIndex === i;
          const isDropTarget = dropIndex === i;
          const isSelected = selectedIds.has(lesson.id);

          return (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              index={i}
              isActive={isActive}
              isEditing={isEditing}
              isDragging={isDragging}
              isDropTarget={isDropTarget}
              isSelected={isSelected}
              editValue={editValue}
              inputRef={editingId === lesson.id ? inputRef : null}
              onSelect={() => !isEditing && onSelectLesson(lesson.id)}
              onStartEdit={(e) => startEdit(e, lesson)}
              onEditChange={(v) => setEditValue(v)}
              onCommit={commitEdit}
              onKeyDown={handleKeyDown}
              onSelectOne={(checked) => handleSelectOne(lesson.id, checked)}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              onDelete={() => onDeleteLesson?.(lesson.id)}
            />
          );
        })}
      </div>

      {/* Footer */}
      {lessons.length > 0 && (
        <div
          className="flex-shrink-0 px-4 py-2"
          style={{ borderTop: `1px solid ${t("border-primary")}`, background: t("bg-secondary") }}
        >
          <span style={{ fontSize: 10, color: t("text-disabled") }}>
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
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
  isDragging,
  isDropTarget,
  isSelected,
  editValue,
  inputRef,
  onSelect,
  onStartEdit,
  onEditChange,
  onCommit,
  onKeyDown,
  onSelectOne,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDragEnd,
  onDelete,
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const itemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 10px",
    borderRadius: t("radius-md"),
    cursor: isEditing ? "text" : "pointer",
    marginBottom: 2,
    transition: "background 0.12s, opacity 0.15s",
    background: isActive ? t("bg-active") : hovered ? t("bg-hover") : "transparent",
    borderLeft: isActive ? `2px solid ${t("text-primary")}` : "2px solid transparent",
    opacity: isDragging ? 0.4 : 1,
    position: "relative",
  };

  const badgeStyle = {
    width: 18,
    height: 18,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
    flexShrink: 0,
    transition: "background 0.12s",
    background: isActive ? t("text-primary") : t("bg-hover"),
    color: isActive ? t("bg-surface") : t("text-muted"),
  };

  return (
    <div
      style={itemStyle}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isEditing ? undefined : "Drag to reorder · Double-click to rename"}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {isDropTarget && (
        <div
          style={{
            position: "absolute",
            top: -1,
            left: 4,
            right: 4,
            height: 2,
            background: t("text-primary"),
            borderRadius: 1,
          }}
        />
      )}

      {/* Checkbox */}
      <div
        style={{
          width: 14,
          height: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectOne(!isSelected);
          }}
          style={{
            width: 14,
            height: 14,
            borderRadius: 2,
            border: `1.5px solid ${isSelected ? t("text-primary") : t("text-disabled")}`,
            background: isSelected ? t("text-primary") : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          {isSelected && (
            <svg
              style={{ width: 9, height: 9, color: t("bg-surface") }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>
      </div>

      <div
        style={{
          width: 14,
          height: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "grab",
          color: hovered ? t("text-secondary") : t("text-disabled"),
          userSelect: "none",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <svg style={{ width: 10, height: 10 }} fill="currentColor" viewBox="0 0 24 24">
          <circle cx={9} cy={6} r="1.5" />
          <circle cx={15} cy={6} r="1.5" />
          <circle cx={9} cy={12} r="1.5" />
          <circle cx={15} cy={12} r="1.5" />
          <circle cx={9} cy={18} r="1.5" />
          <circle cx={15} cy={18} r="1.5" />
        </svg>
      </div>

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
            background: t("bg-surface"),
            border: `1px solid ${t("text-primary")}`,
            borderRadius: t("radius-sm"),
            padding: "1px 6px",
            outline: "none",
            color: t("text-primary"),
            boxShadow: `0 0 0 2px ${t("text-primary")}1A`,
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
              color: isActive ? t("text-primary") : t("text-secondary"),
              fontWeight: isActive ? 550 : 450,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            onDoubleClick={onStartEdit}
          >
            {lesson.title || `Lesson ${index + 1}`}
          </span>

          {hovered && (
            <>
              <button
                onClick={onStartEdit}
                title="Rename"
                style={{
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: t("radius-sm"),
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: t("text-muted"),
                  flexShrink: 0,
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = t("text-primary");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = t("text-muted");
                }}
              >
                <svg
                  style={{ width: 11, height: 11 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                  />
                </svg>
              </button>
              {showConfirm ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: t("error") }}>Delete?</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                      setShowConfirm(false);
                    }}
                    title="Confirm delete"
                    style={{
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: t("radius-sm"),
                      border: "none",
                      background: t("error-light"),
                      cursor: "pointer",
                      color: t("error"),
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    <svg
                      style={{ width: 10, height: 10 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirm(false);
                    }}
                    title="Cancel"
                    style={{
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: t("radius-sm"),
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: t("text-muted"),
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    <svg
                      style={{ width: 10, height: 10 }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                  title="Delete lesson"
                  style={{
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: t("radius-sm"),
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t("text-muted"),
                    flexShrink: 0,
                    padding: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = t("error");
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = t("text-muted");
                  }}
                >
                  <svg
                    style={{ width: 11, height: 11 }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LessonPanel;
