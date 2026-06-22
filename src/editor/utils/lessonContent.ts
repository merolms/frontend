// Shared lesson-content loading and parsing.
//
// Lesson content lives in two places:
//   1. The autosave endpoint — a snapshot of shape
//      { content: <doc JSON string | doc array>, format: "blocknote" }
//      (`format: "blocknote"` is a legacy label; the editor has since moved
//      to TipTap, but old snapshots may still carry it. The doc array inside
//      is still consumable — see `parseSnapshotToDoc`.)
//      Older snapshots may be a bare doc array.
//   2. The blocks API (GET /lessons/:id/blocks) — raw DB block rows that must
//      be converted into document format.
//
// All viewers/editors should resolve content through `loadLessonDoc` so the
// parse rules stay in one place.

import type { JSONContent } from "@tiptap/core";

import { fetchLessonBlocks } from "@/app/services/blockService";

interface RawBlock {
  type?: string;
  content?: string;
  data?: string;
  title?: string;
  id?: string | number;
  order?: number;
}

interface InlineItem {
  type?: string;
  text?: string;
  styles?: Record<string, unknown>;
}

interface ConvertedBlock {
  id: string;
  type: string;
  props: { textAlignment: string; backgroundColor: string; textColor: string };
  content: InlineItem[];
  children: unknown[];
}

const PARA_PROPS = {
  textAlignment: "left",
  backgroundColor: "default",
  textColor: "default",
};

const convertBlock = (block: RawBlock): ConvertedBlock => {
  const type = block.type || "paragraph";
  const contentStr = block.content || block.data || "[]";
  let content: InlineItem[] = [];
  try {
    const parsed = JSON.parse(contentStr);
    if (Array.isArray(parsed)) {
      content = parsed.map((item: InlineItem) => ({
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
    id: String(block.id ?? Math.random()),
    type,
    props: { ...PARA_PROPS },
    content,
    children: [],
  };
};

// Convert raw block rows from the blocks API into a document array.
export const blocksToDoc = (blocks: RawBlock[] | null | undefined): ConvertedBlock[] => {
  if (!blocks || blocks.length === 0) return [];
  const sorted = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));
  return sorted.map(convertBlock);
};

interface AutosaveSnapshot {
  content?: JSONContent | JSONContent[] | string | null;
  format?: string;
}

// Parse an autosave snapshot string into a document object.
// Returns null when the snapshot can't be parsed.
export const parseSnapshotToDoc = (snapshot: unknown): JSONContent | JSONContent[] | null => {
  if (!snapshot) return null;
  try {
    const snap = (typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot) as AutosaveSnapshot | JSONContent[] | JSONContent;

    // Legacy bare-array snapshots.
    if (Array.isArray(snap)) return snap as JSONContent[];

    const content = (snap as AutosaveSnapshot)?.content;
    if (content !== undefined && content !== null && content !== "") {
      if (typeof content === "string") return JSON.parse(content) as JSONContent;
      if (Array.isArray(content)) return content as JSONContent[];
      // Wrapped doc: { content: { type: "doc", content: [...] } }
      if ((content as JSONContent)?.type === "doc" && Array.isArray((content as JSONContent).content)) {
        return content as JSONContent;
      }
    }
    return null;
  } catch {
    return null;
  }
};

// Resolve a lesson's content as a document: autosave snapshot first (most
// recent edits), then fallback to empty.
export const loadLessonDoc = async (
  lessonId: string | number
): Promise<JSONContent | JSONContent[]> => {
  try {
    const autosave = await fetchLessonBlocks(lessonId);
    const doc = parseSnapshotToDoc((autosave as { snapshot?: unknown })?.snapshot);
    if (doc) {
      if (Array.isArray(doc) && doc.length > 0) return doc;
      if (!Array.isArray(doc) && doc.content && doc.content.length > 0) return doc;
    }
  } catch {
    /* fall through */
  }
  return [];
};

export default loadLessonDoc;
