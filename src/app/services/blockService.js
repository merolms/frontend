// Block API Service
// Handles all API calls for the block-based lesson content system.
// Replaces the old lesson.contents[] pattern with lesson.blocks[].

import { apiGet, apiPost, apiPut, apiDelete, apiUpload, API_BASE } from '@/app/services/http';

// ==================== BLOCK TYPE CONSTANTS ====================

export const BLOCK_TYPES = {
  TEXT: 'text',
  HEADING: 'heading',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  QUIZ: 'quiz',
  CODE: 'code',
  ATTACHMENT: 'attachment',
  AI_SUMMARY: 'ai_summary',
  EMBED: 'embed',
};

export const BLOCK_TYPE_LABELS = {
  [BLOCK_TYPES.TEXT]: 'Text',
  [BLOCK_TYPES.HEADING]: 'Heading',
  [BLOCK_TYPES.IMAGE]: 'Image',
  [BLOCK_TYPES.AUDIO]: 'Audio',
  [BLOCK_TYPES.VIDEO]: 'Video',
  [BLOCK_TYPES.QUIZ]: 'Quiz',
  [BLOCK_TYPES.CODE]: 'Code',
  [BLOCK_TYPES.ATTACHMENT]: 'Attachment',
  [BLOCK_TYPES.AI_SUMMARY]: 'AI Summary',
  [BLOCK_TYPES.EMBED]: 'Embed',
};

export const BLOCK_TYPE_ICONS = {
  [BLOCK_TYPES.TEXT]: 'file text',
  [BLOCK_TYPES.HEADING]: 'heading',
  [BLOCK_TYPES.IMAGE]: 'image',
  [BLOCK_TYPES.AUDIO]: 'volume up',
  [BLOCK_TYPES.VIDEO]: 'video',
  [BLOCK_TYPES.QUIZ]: 'question circle',
  [BLOCK_TYPES.CODE]: 'code',
  [BLOCK_TYPES.ATTACHMENT]: 'paperclip',
  [BLOCK_TYPES.AI_SUMMARY]: 'magic',
  [BLOCK_TYPES.EMBED]: 'linkify',
};

// ==================== NORMALIZATION ====================

const normalizeBlock = (b) => ({
  id: b.id,
  lessonId: b.lessonId || b.lesson_id,
  type: b.type || 'text',
  title: b.title || '',
  content: b.content || '',
  data: b.data || null, // JSON string from backend; parse when needed
  order: b.order || 0,
  status: b.status || 'draft',
  updatedAt: b.updatedAt || b.updated_at,
  createdAt: b.createdAt || b.created_at,
});

// ==================== BLOCK CRUD ====================

/**
 * Fetch all blocks for a lesson, ordered by position.
 */
export const fetchBlocks = async (lessonId) => {
  try {
    const data = await apiGet(`/lessons/${lessonId}/blocks`);
    const list = Array.isArray(data) ? data : (data.data || []);
    return list.map(normalizeBlock);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
};

/**
 * Fetch a single block by ID.
 */
export const fetchBlock = async (blockId) => {
  try {
    const data = await apiGet(`/blocks/${blockId}`);
    return normalizeBlock(data);
  } catch (error) {
    console.error('Error fetching block:', error);
    throw error;
  }
};

/**
 * Create a new block in a lesson.
 */
export const createBlock = async (lessonId, blockData) => {
  try {
    const payload = {
      type: blockData.type || 'text',
      title: blockData.title || '',
      content: blockData.content || '',
      data: blockData.data || null,
      order: blockData.order || 0,
      status: blockData.status || 'draft',
    };
    const data = await apiPost(`/lessons/${lessonId}/blocks`, payload);
    return normalizeBlock(data);
  } catch (error) {
    console.error('Error creating block:', error);
    throw error;
  }
};

/**
 * Update an existing block.
 */
export const updateBlock = async (blockId, blockData) => {
  try {
    const payload = {
      type: blockData.type || 'text',
      title: blockData.title || '',
      content: blockData.content || '',
      data: blockData.data || null,
      order: blockData.order || 0,
      status: blockData.status || 'draft',
    };
    const data = await apiPut(`/blocks/${blockId}`, payload);
    return normalizeBlock(data);
  } catch (error) {
    console.error('Error updating block:', error);
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
    console.error('Error deleting block:', error);
    throw error;
  }
};

/**
 * Reorder blocks within a lesson.
 * blockIDs should be an array of block IDs in the desired order.
 */
export const reorderBlocks = async (lessonId, blockIDs) => {
  try {
    return await apiPut(`/lessons/${lessonId}/blocks/reorder`, { blockIDs });
  } catch (error) {
    console.error('Error reordering blocks:', error);
    throw error;
  }
};

// ==================== VERSION HISTORY ====================

/**
 * Fetch version history for a block.
 */
export const fetchBlockVersions = async (blockId) => {
  try {
    const data = await apiGet(`/blocks/${blockId}/versions`);
    const list = Array.isArray(data) ? data : (data.data || []);
    return list.map(v => ({
      id: v.id,
      blockId: v.blockId || v.block_id,
      versionNumber: v.versionNumber || v.version_number,
      type: v.type,
      title: v.title || '',
      content: v.content || '',
      data: v.data || null,
      order: v.order || 0,
      savedBy: v.savedBy || v.saved_by,
      createdAt: v.createdAt || v.created_at,
    }));
  } catch (error) {
    console.error('Error fetching block versions:', error);
    throw error;
  }
};

/**
 * Restore a block to a previous version.
 */
export const restoreBlockVersion = async (versionId) => {
  try {
    const data = await apiPost(`/blocks/0/restore`, { versionId });
    return normalizeBlock(data);
  } catch (error) {
    console.error('Error restoring block version:', error);
    throw error;
  }
};

// ==================== AUTOSAVE ====================

/**
 * Save an autosave snapshot for a lesson.
 * snapshot should be a JSON string of the current blocks state.
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

// ==================== AI CONTENT GENERATION ====================

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

// ==================== MEDIA UPLOAD ====================

/**
 * Upload a media file for a block.
 * Returns the full URL to the uploaded file.
 * blockId may be 0 for blocks not yet saved to the server.
 */
export const uploadBlockMedia = async (lessonId, blockId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const safeBlockId = String(blockId).startsWith('temp_') ? 0 : blockId;
  const data = await apiUpload(`/lessons/${lessonId}/blocks/${safeBlockId}/media`, formData);
  const serverBase = API_BASE.replace(/\/api$/, '');
  return data?.url ? `${serverBase}${data.url}` : '';
};

// ==================== MOCK DATA (fallback for dev) ====================

let mockBlocks = [
  {
    id: 1, lessonId: 1, type: 'heading', title: 'Introduction', content: 'Welcome to this lesson',
    data: null, order: 0, status: 'draft', updatedAt: Date.now(), createdAt: Date.now(),
  },
  {
    id: 2, lessonId: 1, type: 'text', title: '', content: 'This is a text block with some content.',
    data: null, order: 1, status: 'draft', updatedAt: Date.now(), createdAt: Date.now(),
  },
  {
    id: 3, lessonId: 1, type: 'code', title: 'Example Code', content: 'console.log("Hello");',
    data: '{"language":"javascript"}', order: 2, status: 'draft', updatedAt: Date.now(), createdAt: Date.now(),
  },
];

export const mockFetchBlocks = async (lessonId) => {
  return mockBlocks.filter(b => b.lessonId === parseInt(lessonId)).sort((a, b) => a.order - b.order);
};

export const mockCreateBlock = async (lessonId, blockData) => {
  const newBlock = {
    ...blockData,
    id: Date.now(),
    lessonId: parseInt(lessonId),
    order: mockBlocks.filter(b => b.lessonId === parseInt(lessonId)).length,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };
  mockBlocks.push(newBlock);
  return newBlock;
};

export const mockUpdateBlock = async (blockId, blockData) => {
  const index = mockBlocks.findIndex(b => b.id === parseInt(blockId));
  if (index === -1) throw new Error('Block not found');
  mockBlocks[index] = { ...mockBlocks[index], ...blockData, updatedAt: Date.now() };
  return mockBlocks[index];
};

export const mockDeleteBlock = async (blockId) => {
  mockBlocks = mockBlocks.filter(b => b.id !== parseInt(blockId));
  return Promise.resolve();
};

export const mockReorderBlocks = async (lessonId, blockIDs) => {
  blockIDs.forEach((id, idx) => {
    const block = mockBlocks.find(b => b.id === id);
    if (block) block.order = idx;
  });
  return Promise.resolve();
};
