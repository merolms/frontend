import { useCallback, useState } from "react";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { t } from "@/styles/theme";

const isValidYoutubeUrl = (url) => {
  if (!url) return false;
  const pattern = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})([^#\&\?]*)*$/;
  return pattern.test(url);
};

const getYoutubeVideoId = (url) => {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function YoutubeCommand({ editor, onClose }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleInsert = useCallback(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL");
      return;
    }

    const videoId = getYoutubeVideoId(trimmed);
    if (!videoId) {
      setError("Invalid YouTube URL or video ID");
      return;
    }

    // Normalize to full URL
    const normalizedSrc = `https://www.youtube.com/watch?v=${videoId}`;

    if (editor && editor._tiptapEditor) {
      const tiptapEditor = editor._tiptapEditor;
      // Check if the youtube extension is available
      if (tiptapEditor.commands.setYoutubeVideo) {
        tiptapEditor.commands.setYoutubeVideo({ src: normalizedSrc });
      } else {
        // Fallback: insert as a paragraph link
        tiptapEditor.commands.setContent(normalizedSrc);
      }
    }

    onClose?.();
  }, [url, editor, onClose]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube size={20} className="text-red-500" />
            Insert YouTube Video
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">YouTube URL or Video ID</label>
          <Input
            autoFocus
            placeholder="https://www/watch?v=... or video ID"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInsert();
            }}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-muted-foreground">
            Paste a YouTube URL (youtube.com/watch?v=..., youtu.be/...) or just the 11-character video ID.
          </p>
        </div>
        <DialogFooter>
          <Button variant="default" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleInsert}>
            Insert Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Toolbar button component
export function YoutubeToolbarButton({ editor }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="h-8 w-8 p-0"
        title="Insert YouTube Video"
      >
        <Youtube size={16} className="text-red-500" />
      </Button>
      {showDialog && (
        <YoutubeCommand editor={editor} onClose={() => setShowDialog(false)} />
      )}
    </>
  );
}
