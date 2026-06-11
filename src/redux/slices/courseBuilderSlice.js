import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  deleteBlock,
  fetchLessonBlocks,
  generateAIContent,
  reorderBlocks,
  saveLessonBlocks,
  updateBlock,
  uploadBlockMedia,
} from "@/app/services/blockService";

// ==================== ASYNC THUNKS ====================

export const loadLessonBlocks = createAsyncThunk(
  "courseBuilder/loadBlocks",
  async (lessonId, { rejectWithValue }) => {
    try {
      return await fetchLessonBlocks(lessonId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load blocks");
    }
  }
);

export const saveBlock = createAsyncThunk(
  "courseBuilder/saveBlock",
  async ({ blockId, blockData }, { rejectWithValue }) => {
    try {
      return await updateBlock(blockId, blockData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update block");
    }
  }
);

export const removeBlock = createAsyncThunk(
  "courseBuilder/removeBlock",
  async (blockId, { rejectWithValue }) => {
    try {
      await deleteBlock(blockId);
      return blockId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete block");
    }
  }
);

export const reorderLessonBlocks = createAsyncThunk(
  "courseBuilder/reorderBlocks",
  async ({ lessonId, blockIds }, { rejectWithValue }) => {
    try {
      return await reorderBlocks(lessonId, blockIds);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to reorder blocks");
    }
  }
);

export const autoSaveContent = createAsyncThunk(
  "courseBuilder/autosave",
  async ({ lessonId, snapshot }, { rejectWithValue }) => {
    try {
      return await saveLessonBlocks(lessonId, snapshot);
    } catch (error) {
      return rejectWithValue(error.message || "Autosave failed");
    }
  }
);

export const loadAutosave = createAsyncThunk(
  "courseBuilder/loadAutosave",
  async (lessonId, { rejectWithValue }) => {
    try {
      return await fetchLessonBlocks(lessonId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load autosave");
    }
  }
);

export const uploadMedia = createAsyncThunk(
  "courseBuilder/uploadMedia",
  async ({ lessonId, blockId, file }, { rejectWithValue }) => {
    try {
      return await uploadBlockMedia(lessonId, blockId, file);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to upload media");
    }
  }
);

export const generateAI = createAsyncThunk(
  "courseBuilder/generateAI",
  async ({ lessonId, blockType, prompt }, { rejectWithValue }) => {
    try {
      return await generateAIContent(lessonId, blockType, prompt);
    } catch (error) {
      return rejectWithValue(error.message || "AI generation failed");
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  lessonBlocks: [],
  selectedBlockId: null,
  isDirty: false,
  lastAutosaveAt: null,
  loading: false,
  saving: false,
  error: null,
};

const courseBuilderSlice = createSlice({
  name: "courseBuilder",
  initialState,
  reducers: {
    setSelectedBlock: (state, action) => {
      state.selectedBlockId = action.payload;
    },
    setDirty: (state, action) => {
      state.isDirty = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBuilder: (state) => {
      state.lessonBlocks = [];
      state.selectedBlockId = null;
      state.isDirty = false;
      state.lastAutosaveAt = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadLessonBlocks
      .addCase(loadLessonBlocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLessonBlocks.fulfilled, (state, action) => {
        state.loading = false;
        state.lessonBlocks = action.payload || [];
      })
      .addCase(loadLessonBlocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // saveBlock
      .addCase(saveBlock.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveBlock.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.lessonBlocks.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.lessonBlocks[idx] = action.payload;
        state.isDirty = false;
      })
      .addCase(saveBlock.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // removeBlock
      .addCase(removeBlock.fulfilled, (state, action) => {
        state.lessonBlocks = state.lessonBlocks.filter((b) => b.id !== action.payload);
        state.isDirty = true;
      })
      // reorderLessonBlocks
      .addCase(reorderLessonBlocks.fulfilled, (state) => {
        state.isDirty = true;
      })
      // autoSaveContent
      .addCase(autoSaveContent.fulfilled, (state) => {
        state.lastAutosaveAt = Date.now();
        state.isDirty = false;
      })
      // loadAutosave
      .addCase(loadAutosave.fulfilled, (state, action) => {
        if (action.payload?.snapshot) {
          try {
            const parsed = JSON.parse(action.payload.snapshot);
            const blocks = Array.isArray(parsed) ? parsed : parsed.content;
            if (Array.isArray(blocks)) state.lessonBlocks = blocks;
          } catch {
            /* ignore parse errors */
          }
        }
      })
      // uploadMedia
      .addCase(uploadMedia.fulfilled, (state, action) => {
        // URL is returned, block data should be updated by the component
      })
      // generateAI
      .addCase(generateAI.pending, (state) => {
        state.loading = true;
      })
      .addCase(generateAI.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedBlock, setDirty, clearError, resetBuilder } = courseBuilderSlice.actions;
export default courseBuilderSlice.reducer;
