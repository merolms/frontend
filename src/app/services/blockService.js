// Block-based content service
// Now uses BlockNote JSON format for lesson content.
// Content is stored as a JSON string of BlockNote block array.

import { apiGet, apiPost, apiPut, apiDelete, apiUpload, API_BASE } from '@/app/services/http';

// ─── CONTENT HELPERS ────────────────────────────────────────────

/**
 * Normalize raw content from various formats into a BlockNote-compatible
 * JSON string.
 */
export const normalizeContent = (content) => {
  if (!content) return JSON.stringify([]);
  const paraProps = { textAlignment: 'left', backgroundColor: 'default', textColor: 'default' };

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return content; // already valid block array
      if (parsed && parsed.content) {
        // Legacy format: { content: "...", format: "..." }
        return JSON.stringify([{ type: 'paragraph', props: paraProps, content: [{ type: 'text', text: typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content), styles: {} }], children: [] }]);
      }
      if (typeof parsed === 'string') {
        return JSON.stringify([{ type: 'paragraph', props: paraProps, content: [{ type: 'text', text: parsed, styles: {} }], children: [] }]);
      }
      return JSON.stringify([parsed]);
    } catch {
      // Not valid JSON — treat as plain text
      return JSON.stringify([{ type: 'paragraph', props: paraProps, content: [{ type: 'text', text: content, styles: {} }], children: [] }]);
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
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
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
    console.error('Error saving autosave:', error);
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
    console.error('Error fetching autosave:', error);
    throw error;
  }
};

// ─── MEDIA UPLOAD ──────────────────────────────────────────────

/**
 * Upload a media file for a lesson.
 * Returns the full URL to the uploaded file.
 */
export const uploadBlockMedia = async (lessonId, blockId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const safeBlockId = String(blockId).startsWith('temp_') ? 0 : blockId;
  const data = await apiUpload(`/lessons/${lessonId}/blocks/${safeBlockId}/media`, formData);
  const serverBase = API_BASE.replace(/\/api$/, '');
  return data?.url ? `${serverBase}${data.url}` : '';
};

// ─── AI CONTENT GENERATION ─────────────────────────────────────

/**
 * Generate AI content for a block.
 */
export const generateAIContent = async (lessonId, blockType, prompt, context = '') => {
  try {
    const data = await apiPost('/ai/generate', {
      lessonId,
      blockType,
      prompt,
      context,
    });
    return {
      content: data.content || '',
      data: data.data || null,
    };
  } catch (error) {
    console.error('Error generating AI content:', error);
    throw error;
  }
};

// ─── MOCK DATA (fallback for dev) ──────────────────────────────

export const mockSaveAutosave = async (lessonId, snapshot) => {
  console.log('[mock] saveAutosave', lessonId, snapshot?.slice(0, 60));
  return Promise.resolve({ id: Date.now(), lessonId, snapshot });
};

export const mockFetchAutosave = async (lessonId) => {
  return Promise.resolve(null);
};
