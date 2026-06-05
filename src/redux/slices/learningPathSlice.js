import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchLearningPaths,
  fetchLearningPathById,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  enrollInLearningPath,
  fetchLearningPathProgress,
  fetchLearningPathStat,
} from "@/app/services/learningPathService";

// ==================== ASYNC THUNKS ====================

export const fetchPaths = createAsyncThunk(
  "learningPaths/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchLearningPaths(params);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch learning paths");
    }
  }
);

export const fetchPathById = createAsyncThunk(
  "learningPaths/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchLearningPathById(id);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch learning path");
    }
  }
);

export const createPath = createAsyncThunk(
  "learningPaths/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createLearningPath(data);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create learning path");
    }
  }
);

export const updatePath = createAsyncThunk(
  "learningPaths/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateLearningPath(id, data);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update learning path");
    }
  }
);

export const deletePath = createAsyncThunk(
  "learningPaths/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteLearningPath(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete learning path");
    }
  }
);

export const enrollInPath = createAsyncThunk(
  "learningPaths/enroll",
  async (id, { rejectWithValue }) => {
    try {
      return await enrollInLearningPath(id);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to enroll");
    }
  }
);

export const fetchPathProgress = createAsyncThunk(
  "learningPaths/fetchProgress",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchLearningPathProgress(id);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch progress");
    }
  }
);

export const fetchPathStat = createAsyncThunk(
  "learningPaths/fetchStat",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchLearningPathStat(params);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch stat");
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  paths: [],
  currentPath: null,
  currentEnrollment: null,
  progress: null,
  total: 0,
  page: 1,
  limit: 6,
  totalPages: 1,
  stat: 0,
  loading: false,
  error: null,
};

const learningPathSlice = createSlice({
  name: "learningPaths",
  initialState,
  reducers: {
    clearCurrentPath: (state) => {
      state.currentPath = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPaths
      .addCase(fetchPaths.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaths.fulfilled, (state, action) => {
        state.loading = false;
        state.paths = action.payload.paths || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 6;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchPaths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchPathById
      .addCase(fetchPathById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPathById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPath = action.payload;
      })
      .addCase(fetchPathById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createPath
      .addCase(createPath.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPath.fulfilled, (state, action) => {
        state.loading = false;
        state.paths.unshift(action.payload);
      })
      .addCase(createPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updatePath
      .addCase(updatePath.fulfilled, (state, action) => {
        const idx = state.paths.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.paths[idx] = action.payload;
        if (state.currentPath?.id === action.payload.id) state.currentPath = action.payload;
      })
      // deletePath
      .addCase(deletePath.fulfilled, (state, action) => {
        state.paths = state.paths.filter((p) => p.id !== action.payload);
      })
      // enrollInPath
      .addCase(enrollInPath.fulfilled, (state, action) => {
        state.currentEnrollment = action.payload;
      })
      // fetchPathProgress
      .addCase(fetchPathProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      })
      // fetchPathStat
      .addCase(fetchPathStat.fulfilled, (state, action) => {
        state.stat = action.payload;
      });
  },
});

export const { clearCurrentPath, clearError } = learningPathSlice.actions;
export default learningPathSlice.reducer;
