import { Archive, ArchiveRestore, Check, LogOut, Trash2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const PublishModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Dialog open={open} onOpenChange={loading ? undefined : onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Publish Course</DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Are you sure you want to publish <strong>{courseTitle}</strong>? Once published, it will be
        visible to all users.
      </p>
      <DialogFooter>
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          <Check size={14} /> Publish
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const ArchiveModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Dialog open={open} onOpenChange={loading ? undefined : onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Archive Course</DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Are you sure you want to archive <strong>{courseTitle}</strong>? archived courses are hidden
        from users but can be restored later.
      </p>
      <DialogFooter>
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          <Archive size={14} /> Archive
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const DeleteModal = ({
  open,
  onConfirm,
  onCancel,
  itemName,
  itemType = "course",
  loading = false,
  warnings = null, // { lessons: number, enrolled: number, assignments: number, quizzes: number }
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

      {warnings && (warnings.lessons || warnings.enrolled || warnings.assignments || warnings.quizzes) && (
        <div className="border-destructive/20 bg-destructive/5 mt-4 rounded-lg border p-4">
          <div className="text-destructive mb-2 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={16} />
            Warning: This course contains data
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

export const DropModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Dialog open={open} onOpenChange={loading ? undefined : onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Drop Course</DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Are you sure you want to drop <strong>{courseTitle}</strong>? Your progress is kept and you
        can re-enroll at any time.
      </p>
      <DialogFooter>
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          <LogOut size={14} /> Drop Course
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const RestoreModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Dialog open={open} onOpenChange={loading ? undefined : onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Restore Course</DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Restore <strong>{courseTitle}</strong> to draft? It will be editable again and can be
        republished when ready.
      </p>
      <DialogFooter>
        <Button variant="default" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          <ArchiveRestore size={14} /> Restore to draft
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default { PublishModal, ArchiveModal, DeleteModal, DropModal, RestoreModal };
