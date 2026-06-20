import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DeleteModal = ({
  open,
  onConfirm,
  onCancel,
  itemName,
  itemType = "course",
  loading = false,
  warnings = null, // { lessons: number, enrolled: number, assignments: number, quizzes: number, members: number }
}) => (
  <Dialog open={open} onOpenChange={loading ? undefined : onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Delete{" "}
          {itemType === "lesson"
            ? "Lesson"
            : itemType === "user"
              ? "User"
              : itemType === "team"
                ? "Team"
                : itemType === "event"
                  ? "Event"
                  : itemType === "courses"
                    ? "Courses"
                    : "Course"}
        </DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.
      </p>

      {warnings && (warnings.lessons || warnings.enrolled || warnings.assignments || warnings.quizzes || warnings.members) && (
        <div className="border-destructive/20 bg-destructive/5 mt-4 rounded-lg border p-4">
          <div className="text-destructive mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={16} />
            Warning: This {itemType === "team" ? "team" : "course"} contains data
          </div>
          <ul className="text-text-muted text-xs space-y-1">
            {warnings.lessons && (
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>{warnings.lessons} lesson{warnings.lessons === 1 ? "" : "s"}</span>
              </li>
            )}
            {warnings.enrolled && (
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>{warnings.enrolled} enrolled user{warnings.enrolled === 1 ? "" : "s"}</span>
              </li>
            )}
            {warnings.assignments && (
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>{warnings.assignments} assignment submission{warnings.assignments === 1 ? "" : "s"}</span>
              </li>
            )}
            {warnings.quizzes && (
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>{warnings.quizzes} quiz result{warnings.quizzes === 1 ? "" : "s"}</span>
              </li>
            )}
            {warnings.members && (
              <li className="flex items-center gap-2">
                <span>•</span>
                <span>{warnings.members} member{warnings.members === 1 ? "" : "s"}</span>
              </li>
            )}
          </ul>
          <p className="text-text-muted mt-2 text-xs">
            Deleting will permanently remove all associated data.
          </p>
        </div>
      )}

      <DialogFooter>
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          <Trash2 size={14} /> Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
