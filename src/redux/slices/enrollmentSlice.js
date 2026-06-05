import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchEnrollments,
  enrollInCourse,
  markLessonComplete,
  isEnrolled,
} from "@/app/services/enrollmentService";

// ==================== ASYNC THUNKS ====================

export const fetchMyEnrollments = createAsyncThunk(
  "enrollments/fetchMine",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchEnrollments(params);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch enrollments");
    }
  }
);

export const fetchEnrollmentProgress = createAsyncThunk(
  "enrollments/fetchProgress",
  async ({ courseId, userId }, { rejectWithValue }) => {
    try {
      // Progress is fetched via the enrollment service
      const enrollment = await isEnrolled(userId, courseId);
      return enrollment;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch progress");
    }
  }
);

export const enrollInCourseThunk = createAsyncThunk(
  "enrollments/enroll",
  async ({ userId, courseId }, { rejectWithValue }) => {
    try {
      return await enrollInCourse(userId, courseId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to enroll");
    }
  }
);

export const markLessonCompleteThunk = createAsyncThunk(
  "enrollments/markLessonComplete",
  async ({ userId, courseId, lessonId, totalLessons }, { rejectWithValue }) => {
    try {
      return await markLessonComplete(userId, courseId, lessonId, totalLessons);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to mark lesson complete");
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  enrollments: [],
  currentEnrollment: null,
  loading: false,
  error: null,
};

const enrollmentSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    clearEnrollmentError: (state) => {
      state.error = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMyEnrollments
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload || [];
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchEnrollmentProgress
      .addCase(fetchEnrollmentProgress.fulfilled, (state, action) => {
        state.currentEnrollment = action.payload;
      })
      // enrollInCourse
      .addCase(enrollInCourseThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourseThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEnrollment = action.payload;
        // Add to enrollments list if not already there
        const exists = state.enrollments.find(
          (e) => e.courseId === action.payload.courseId && e.userId === action.payload.userId
        );
        if (!exists) state.enrollments.unshift(action.payload);
      })
      .addCase(enrollInCourseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // markLessonComplete
      .addCase(markLessonCompleteThunk.fulfilled, (state, action) => {
        state.currentEnrollment = action.payload;
        // Update in enrollments list
        const idx = state.enrollments.findIndex((e) => e.courseId === action.payload.courseId);
        if (idx !== -1) state.enrollments[idx] = action.payload;
      });
  },
});

export const { clearEnrollmentError, clearCurrentEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
