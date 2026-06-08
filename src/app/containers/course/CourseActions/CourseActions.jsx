import { Archive, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const PublishModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Dialog open={open} onOpenChange={loading ? undefined : onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Publish Course</DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Are you sure you want to publish <strong>{courseTitle}</strong>? Once published, it will
        be visible to all users.
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
        Are you sure you want to archive <strong>{courseTitle}</strong>? Archived courses are
        hidden from users but can be restored later.
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
                  : "Course"}
        </DialogTitle>
      </DialogHeader>
      <p className="text-text-secondary text-sm">
        Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be
        undone.
      </p>
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

export default { PublishModal, ArchiveModal, DeleteModal };
