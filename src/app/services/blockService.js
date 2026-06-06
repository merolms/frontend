// Block-based content service
// Now uses BlockNote JSON format for lesson content.
// Content is stored as a JSON string of BlockNote block array.

import { API_BASE, apiDelete, apiGet, apiPost, apiPut, apiUpload } from "@/app/services/http";

// ─── CONTENT HELPERS ────────────────────────────────────────────

/**
 * Normalize raw content from various formats into a BlockNote-compatible
 * JSON string.
 */
export const normalizeContent = (content) => {
  if (!content) return JSON.stringify([]);
  const paraProps = { textAlignment: "left", backgroundColor: "default", textColor: "default" };

  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return content; // already valid block array
      if (parsed && parsed.content) {
        // Legacy format: { content: "...", format: "..." }
        return JSON.stringify([
          {
            type: "paragraph",
            props: paraProps,
            content: [
              {
                type: "text",
                text:
                  typeof parsed.content === "string"
                    ? parsed.content
                    : JSON.stringify(parsed.content),
                styles: {},
              },
            ],
            children: [],
          },
        ]);
      }
      if (typeof parsed === "string") {
        return JSON.stringify([
          {
            type: "paragraph",
            props: paraProps,
            content: [{ type: "text", text: parsed, styles: {} }],
            children: [],
          },
        ]);
      }
      return JSON.stringify([parsed]);
    } catch {
      // Not valid JSON — treat as plain text
      return JSON.stringify([
        {
          type: "paragraph",
          props: paraProps,
          content: [{ type: "text", text: content, styles: {} }],
          children: [],
        },
      ]);
    }
  }
  if (Array.isArray(content)) return JSON.stringify(content);
  return JSON.stringify(content);
};

/**
 * Parse BlockNote content string back to an array of blocks.
 */
export const parseBlocks = (content) => {
  if (!content) return [];
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ─── AUTOSAVE ─────────────────────────────────────────────────

/**
 * Save an autosave snapshot for a lesson.
 * snapshot should be a JSON string.
 */
export const saveAutosave = async (lessonId, snapshot) => {
  try {
    return await apiPost(`/lessons/${lessonId}/autosave`, { snapshot });
  } catch (error) {
    console.error("Error saving autosave:", error);
    throw error;
  }
};

/**
 * Fetch the latest autosave for a lesson.
 */
export const fetchAutosave = async (lessonId) => {
  try {
    const data = await apiGet(`/lessons/${lessonId}/autosave`);
    if (!data) return null;
    return {
      id: data.id,
      lessonId: data.lessonId || data.lesson_id,
      userId: data.userId || data.user_id,
      snapshot: data.snapshot,
      createdAt: data.createdAt || data.created_at,
    };
  } catch (error) {
    console.error("Error fetching autosave:", error);
    throw error;
  }
};

// ─── BLOCKS ─────────────────────────────────────────────────────

/**
 * Fetch all blocks for a lesson from the blocks API.
 * Returns blocks sorted by order field.
 */
export const fetchLessonBlocks = async (lessonId) => {
  try {
    const data = await apiGet(`/lessons/${lessonId}/blocks`);
    const list = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  } catch (error) {
    console.error("Error fetching lesson blocks:", error);
    throw error;
  }
};

/**
 * Create a new block in a lesson.
 */
export const createBlock = async (lessonId, blockData) => {
  try {
    return await apiPost(`/lessons/${lessonId}/blocks`, blockData);
  } catch (error) {
    console.error("Error creating block:", error);
    throw error;
  }
};

/**
 * Fetch a single block by ID.
 */
export const fetchBlockById = async (blockId) => {
  try {
    return await apiGet(`/blocks/${blockId}`);
  } catch (error) {
    console.error("Error fetching block:", error);
    throw error;
  }
};

/**
 * Update a block.
 */
export const updateBlock = async (blockId, blockData) => {
  try {
    return await apiPut(`/blocks/${blockId}`, blockData);
  } catch (error) {
    console.error("Error updating block:", error);
    throw error;
  }
};

/**
 * Delete a block.
 */
export const deleteBlock = async (blockId) => {
  try {
    return await apiDelete(`/blocks/${blockId}`);
  } catch (error) {
    console.error("Error deleting block:", error);
    throw error;
  }
};

/**
 * Reorder blocks within a lesson.
 */
export const reorderBlocks = async (lessonId, blockIds) => {
  try {
    return await apiPut(`/lessons/${lessonId}/blocks/reorder`, { blockIds });
  } catch (error) {
    console.error("Error reordering blocks:", error);
    throw error;
  }
};

/**
 * Fetch version history for a block.
 */
export const fetchBlockVersions = async (blockId) => {
  try {
    return await apiGet(`/blocks/${blockId}/versions`);
  } catch (error) {
    console.error("Error fetching block versions:", error);
    throw error;
  }
};

/**
 * Restore a block to a previous version.
 */
export const restoreBlockVersion = async (blockId, versionId) => {
  try {
    return await apiPost(`/blocks/${blockId}/restore`, { versionId });
  } catch (error) {
    console.error("Error restoring block version:", error);
    throw error;
  }
};

// ─── MEDIA UPLOAD ──────────────────────────────────────────────

/**
 * Upload a media file for a lesson.
 * Returns the full URL to the uploaded file.
 */
export const uploadBlockMedia = async (lessonId, blockId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const endpoint = `/lessons/${lessonId}/media`;
    const data = await apiUpload(endpoint, formData);
    if (!data?.url) return "";
    const serverBase = API_BASE.replace(/\/api$/, "");
    return `${serverBase}${data.url}`;
  } catch (error) {
    console.error("Error uploading block media:", error);
    throw error;
  }
};

// ─── AI CONTENT GENERATION ─────────────────────────────────────

/**
 * Generate AI content for a block.
 */
export const generateAIContent = async (lessonId, blockType, prompt, context = "") => {
  try {
    const data = await apiPost("/ai/generate", {
      lessonId,
      blockType,
      prompt,
      context,
    });
    return {
      content: data.content || "",
      data: data.data || null,
    };
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
};

// ─── MOCK DATA (fallback for dev) ──────────────────────────────

export const mockSaveAutosave = async (lessonId, snapshot) => {
  console.log("[mock] saveAutosave", lessonId, snapshot?.slice(0, 60));
  return Promise.resolve({ id: Date.now(), lessonId, snapshot });
};

export const mockFetchAutosave = async (lessonId) => {
  return Promise.resolve(null);
};
