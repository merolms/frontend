import {
  Book,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Globe,
  GripVertical,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

// Helper function to get status icon and color
const getStatusConfig = (status) => {
  switch (status) {
    case "published":
      return {
        icon: Globe,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        label: "Published",
      };
    case "scheduled":
      return {
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        label: "Scheduled",
      };
    case "private":
      return {
        icon: Lock,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        label: "Private",
      };
    case "draft":
    default:
      return {
        icon: Book,
        color: "text-gray-400",
        bgColor: "bg-gray-400/10",
        label: "Draft",
      };
  }
};

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
  pagination = { currentPage: 1, totalPages: 1, totalLessons: 0 },
  onPageChange,
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
      className={cn(
        "bg-background border-border/30 flex flex-col overflow-hidden border-r",
        isDragging && "border-primary/50 border-r-2"
      )}
      style={{ width, flexShrink: 0, height: "fit-content" }}
    >
      {/* Header */}
      <div className="border-border/30 from-accent/30 to-accent/30 flex flex-shrink-0 items-center justify-between border-b bg-gradient-to-r via-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          {lessons.length > 0 && (
            <button
              onClick={() => handleSelectAll(selectedIds.size !== lessons.length)}
              title={selectedIds.size === lessons.length ? "Deselect all" : "Select all"}
              className="hover:border-primary flex h-4 w-4 items-center justify-center rounded border transition-colors"
              style={{
                borderColor:
                  selectedIds.size === lessons.length
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
                background:
                  selectedIds.size === lessons.length ? "hsl(var(--primary))" : "transparent",
              }}
            >
              {selectedIds.size === lessons.length && (
                <Check size={10} className="text-background" />
              )}
            </button>
          )}
          <div className="flex items-center gap-2">
            <Book size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
              Lessons
            </span>
            {pagination.totalPages > 1 && (
              <span className="text-muted-foreground text-[10px] font-normal">
                ({pagination.currentPage}/{pagination.totalPages})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleBulkDuplicateClick}
                title="Duplicate selected"
                className="hover:bg-accent hover:text-foreground text-muted-foreground flex h-5 w-5 items-center justify-center rounded transition-all"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={handleBulkDeleteClick}
                title="Delete selected"
                className="flex h-5 w-5 items-center justify-center rounded text-red-600 transition-all hover:bg-red-500/20 hover:text-red-500 dark:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
          {onAddLesson && (
            <button
              onClick={onAddLesson}
              disabled={adding}
              title="Add lesson"
              className="hover:bg-accent hover:text-foreground text-muted-foreground flex h-6 w-6 items-center justify-center rounded-lg transition-all disabled:opacity-50"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {lessons.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
            <Book size={32} className="mb-2 opacity-30" />
            <span className="text-sm">No lessons yet</span>
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
        <div className="border-border/30 from-accent/20 to-accent/20 flex-shrink-0 border-t bg-gradient-to-r via-transparent px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[10px]">
              {pagination.totalLessons} {pagination.totalLessons === 1 ? "lesson" : "lessons"}
            </span>

            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="hover:bg-accent text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                  title="Previous page"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="text-muted-foreground min-w-[40px] text-center text-[10px]">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="hover:bg-accent text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                  title="Next page"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
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

  return (
    <div
      className={cn(
        "relative mb-0.5 flex items-center gap-1.5 rounded-lg px-2.5 py-2 transition-all duration-150",
        "border-l-2",
        isDragging && "opacity-40",
        isActive
          ? "bg-primary/10 border-l-primary"
          : "hover:bg-accent/50 cursor-pointer border-l-transparent"
      )}
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
        <div className="bg-primary absolute -top-0.5 right-1 left-1 h-0.5 rounded-sm" />
      )}

      {/* Checkbox */}
      <div
        className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectOne(!isSelected);
          }}
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded border transition-colors",
            isSelected ? "border-primary bg-primary" : "border-border hover:border-primary"
          )}
        >
          {isSelected && <Check size={9} className="text-background" />}
        </button>
      </div>

      {/* Drag handle */}
      <div
        className="text-muted-foreground hover:text-foreground flex h-4.5 w-3.5 flex-shrink-0 cursor-grab items-center justify-center"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={10} />
      </div>

      {/* Badge */}
      <div
        className={cn(
          "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
          isActive ? "bg-primary text-primary-foreground" : "bg-accent/50 text-muted-foreground"
        )}
      >
        {index + 1}
      </div>

      {/* Status Indicator */}
      {(() => {
        const statusConfig = getStatusConfig(lesson.status);
        const StatusIcon = statusConfig.icon;
        return (
          <div
            className={cn(
              "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded",
              statusConfig.bgColor
            )}
            title={statusConfig.label}
          >
            <StatusIcon size={10} className={statusConfig.color} />
          </div>
        );
      })()}

      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={onKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="bg-background border-primary focus:ring-primary/50 min-w-0 flex-1 rounded-md border px-2 py-0.5 text-sm outline-none focus:ring-2"
          autoFocus
        />
      ) : (
        <>
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm",
              isActive ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
            )}
            onDoubleClick={onStartEdit}
          >
            {lesson.title || `Lesson ${index + 1}`}
          </span>

          {hovered && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={onStartEdit}
                title="Rename"
                className="hover:bg-accent text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center rounded transition-colors"
              >
                <Pencil size={11} />
              </button>
              {showConfirm ? (
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] text-red-500">Delete?</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                      setShowConfirm(false);
                    }}
                    title="Confirm delete"
                    className="flex h-5 w-5 items-center justify-center rounded bg-red-500/20 text-red-500 transition-colors hover:bg-red-500/30"
                  >
                    <Check size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirm(false);
                    }}
                    title="Cancel"
                    className="hover:bg-accent text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center rounded transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                  title="Delete lesson"
                  className="text-muted-foreground flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonPanel;
