// Shared lesson-content loading and parsing.
//
// Lesson content lives in two places:
//   1. The autosave endpoint — a snapshot of shape
//      { content: <doc JSON string | doc array>, format: "blocknote" }
//      (older snapshots may be a bare doc array).
//   2. The blocks API (GET /lessons/:id/blocks) — raw DB block rows that must
//      be converted into BlockNote document format.
//
// All viewers/editors should resolve content through loadLessonDoc so the
// parse rules stay in one place.

import { fetchLessonBlocks } from "@/services/blockService";

const PARA_PROPS = { textAlignment: "left", backgroundColor: "default", textColor: "default" };

const convertBlock = (block) => {
  const type = block.type || "paragraph";
  const contentStr = block.content || block.data || "[]";
  let content = [];
  try {
    const parsed = JSON.parse(contentStr);
    if (Array.isArray(parsed)) {
      content = parsed.map((item) => ({
        type: item.type || "text",
        text: item.text || "",
        styles: item.styles || {},
      }));
    } else if (typeof parsed === "string") {
      content = [{ type: "text", text: parsed, styles: {} }];
    }
  } catch {
    if (typeof contentStr === "string" && contentStr.trim()) {
      content = [{ type: "text", text: contentStr, styles: {} }];
    }
  }
  // Use title as heading text if content is empty
  if (content.length === 0 && block.title && block.title !== block.type) {
    content = [{ type: "text", text: block.title, styles: {} }];
  }
  return {
    id: String(block.id) || String(Math.random()),
    type,
    props: { ...PARA_PROPS },
    content,
    children: [],
  };
};

// Convert raw block rows from the blocks API into a BlockNote document array.
export const blocksToDoc = (blocks) => {
  if (!blocks || blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));
  return sorted.map(convertBlock);
};

// Parse an autosave snapshot string into a BlockNote/Tiptap document object.
// Returns null when the snapshot can't be parsed.
export const parseSnapshotToDoc = (snapshot) => {
  if (!snapshot) return null;
  try {
    const snap = typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot;
    if (Array.isArray(snap)) return snap;
    if (snap?.content !== undefined && snap.content !== null && snap.content !== "") {
      if (typeof snap.content === "string") return JSON.parse(snap.content);
      if (Array.isArray(snap.content)) return snap.content;
      // BlockNote format: { content: { type: "doc", content: [...] } }
      if (snap.content?.type === "doc" && Array.isArray(snap.content.content)) {
        return snap.content;
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Resolve a lesson's content as a BlockNote document:
// autosave snapshot first (most recent edits), then fallback to empty.
export const loadLessonDoc = async (lessonId) => {
  try {
    const autosave = await fetchLessonBlocks(lessonId);
    const doc = parseSnapshotToDoc(autosave?.snapshot);
    if (doc) {
      // Array doc: check length; Object doc {type:"doc",content:[...]}: check content
      if (Array.isArray(doc) && doc.length > 0) return doc;
      if (!Array.isArray(doc) && doc.content && doc.content.length > 0) return doc;
    }
  } catch {
    /* fall through */
  }
  return [];
};
