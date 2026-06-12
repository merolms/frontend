import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  addAttachment,
  createAssignment,
  deleteAssignment,
  deleteAttachment,
  enrollTeam,
  enrollUser,
  getAssignmentById,
  getAssignmentsByLesson,
  getAttachments,
  getEnrolledTeams,
  getEnrolledUsers,
  getSubmissions,
  gradeSubmission,
  gradeTeamSubmission,
  publishAssignment,
  removeTeamEnrollment,
  removeUserEnrollment,
  submitAssignment,
  submitTeamAssignment,
  updateAssignment,
} from "@/app/services/assignmentService";

// ==================== ASYNC THUNKS ====================

export const fetchAssignmentsByLesson = createAsyncThunk(
  "assignments/fetchByLesson",
  async (lessonId, { rejectWithValue }) => {
    try {
      return await getAssignmentsByLesson(lessonId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch assignments");
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  "assignments/fetchById",
  async (assignmentId, { rejectWithValue }) => {
    try {
      return await getAssignmentById(assignmentId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch assignment");
    }
  }
);

export const createAssignmentThunk = createAsyncThunk(
  "assignments/create",
  async ({ lessonId, assignmentData }, { rejectWithValue }) => {
    try {
      return await createAssignment(lessonId, assignmentData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create assignment");
    }
  }
);

export const updateAssignmentThunk = createAsyncThunk(
  "assignments/update",
  async ({ assignmentId, assignmentData }, { rejectWithValue }) => {
    try {
      return await updateAssignment(assignmentId, assignmentData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update assignment");
    }
  }
);

export const deleteAssignmentThunk = createAsyncThunk(
  "assignments/delete",
  async (assignmentId, { rejectWithValue }) => {
    try {
      await deleteAssignment(assignmentId);
      return assignmentId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete assignment");
    }
  }
);

export const publishAssignmentThunk = createAsyncThunk(
  "assignments/publish",
  async (assignmentId, { rejectWithValue }) => {
    try {
      return await publishAssignment(assignmentId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to publish assignment");
    }
  }
);

export const submitAssignmentThunk = createAsyncThunk(
  "assignments/submit",
  async ({ assignmentId, submissionData }, { rejectWithValue }) => {
    try {
      return await submitAssignment(assignmentId, submissionData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to submit assignment");
    }
  }
);

export const submitTeamAssignmentThunk = createAsyncThunk(
  "assignments/submitTeam",
  async ({ assignmentId, teamId, submissionData }, { rejectWithValue }) => {
    try {
      return await submitTeamAssignment(assignmentId, teamId, submissionData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to submit team assignment");
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  "assignments/fetchSubmissions",
  async (assignmentId, { rejectWithValue }) => {
    try {
      return await getSubmissions(assignmentId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch submissions");
    }
  }
);

export const gradeSubmissionThunk = createAsyncThunk(
  "assignments/grade",
  async ({ submissionId, gradingData }, { rejectWithValue }) => {
    try {
      return await gradeSubmission(submissionId, gradingData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to grade submission");
    }
  }
);

export const gradeTeamSubmissionThunk = createAsyncThunk(
  "assignments/gradeTeam",
  async ({ submissionId, gradingData }, { rejectWithValue }) => {
    try {
      return await gradeTeamSubmission(submissionId, gradingData);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to grade team submission");
    }
  }
);

export const fetchAttachments = createAsyncThunk(
  "assignments/fetchAttachments",
  async (assignmentId, { rejectWithValue }) => {
    try {
      return await getAttachments(assignmentId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch attachments");
    }
  }
);

export const addAttachmentThunk = createAsyncThunk(
  "assignments/addAttachment",
  async ({ assignmentId, mediaId }, { rejectWithValue }) => {
    try {
      return await addAttachment(assignmentId, mediaId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to add attachment");
    }
  }
);

export const deleteAttachmentThunk = createAsyncThunk(
  "assignments/deleteAttachment",
  async (attachmentId, { rejectWithValue }) => {
    try {
      await deleteAttachment(attachmentId);
      return attachmentId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete attachment");
    }
  }
);

export const fetchEnrolledUsers = createAsyncThunk(
  "assignments/fetchEnrolledUsers",
  async (assignmentId, { rejectWithValue }) => {
    try {
      return await getEnrolledUsers(assignmentId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch enrolled users");
    }
  }
);

export const enrollUserThunk = createAsyncThunk(
  "assignments/enrollUser",
  async ({ assignmentId, userId }, { rejectWithValue }) => {
    try {
      return await enrollUser(assignmentId, userId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to enroll user");
    }
  }
);

export const removeUserEnrollmentThunk = createAsyncThunk(
  "assignments/removeUserEnrollment",
  async ({ assignmentId, userId }, { rejectWithValue }) => {
    try {
      await removeUserEnrollment(assignmentId, userId);
      return { assignmentId, userId };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove user enrollment");
    }
  }
);

export const fetchEnrolledTeams = createAsyncThunk(
  "assignments/fetchEnrolledTeams",
  async (assignmentId, { rejectWithValue }) => {
    try {
      return await getEnrolledTeams(assignmentId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch enrolled teams");
    }
  }
);

export const enrollTeamThunk = createAsyncThunk(
  "assignments/enrollTeam",
  async ({ assignmentId, teamId }, { rejectWithValue }) => {
    try {
      return await enrollTeam(assignmentId, teamId);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to enroll team");
    }
  }
);

export const removeTeamEnrollmentThunk = createAsyncThunk(
  "assignments/removeTeamEnrollment",
  async ({ assignmentId, teamId }, { rejectWithValue }) => {
    try {
      await removeTeamEnrollment(assignmentId, teamId);
      return { assignmentId, teamId };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to remove team enrollment");
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  assignments: [],
  currentAssignment: null,
  submissions: [],
  attachments: [],
  enrolledUsers: [],
  enrolledTeams: [],
  loading: false,
  error: null,
};

const assignmentSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    clearAssignmentError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    clearSubmissions: (state) => {
      state.submissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAssignmentsByLesson
      .addCase(fetchAssignmentsByLesson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentsByLesson.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload || [];
      })
      .addCase(fetchAssignmentsByLesson.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAssignmentById
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createAssignment
      .addCase(createAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments.unshift(action.payload);
        state.currentAssignment = action.payload;
      })
      .addCase(createAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateAssignment
      .addCase(updateAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.assignments.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.assignments[idx] = action.payload;
        if (state.currentAssignment?.id === action.payload.id) {
          state.currentAssignment = action.payload;
        }
      })
      .addCase(updateAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deleteAssignment
      .addCase(deleteAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = state.assignments.filter((a) => a.id !== action.payload);
        if (state.currentAssignment?.id === action.payload) {
          state.currentAssignment = null;
        }
      })
      .addCase(deleteAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // publishAssignment
      .addCase(publishAssignmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishAssignmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.assignments.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.assignments[idx] = action.payload;
        if (state.currentAssignment?.id === action.payload.id) {
          state.currentAssignment = action.payload;
        }
      })
      .addCase(publishAssignmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchSubmissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload || [];
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // submitAssignment
      .addCase(submitAssignmentThunk.fulfilled, (state, action) => {
        state.submissions.unshift(action.payload);
      })
      // submitTeamAssignment
      .addCase(submitTeamAssignmentThunk.fulfilled, (state, action) => {
        state.submissions.unshift(action.payload);
      })
      // gradeSubmission
      .addCase(gradeSubmissionThunk.fulfilled, (state, action) => {
        const idx = state.submissions.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.submissions[idx] = action.payload;
      })
      // gradeTeamSubmission
      .addCase(gradeTeamSubmissionThunk.fulfilled, (state, action) => {
        const idx = state.submissions.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.submissions[idx] = action.payload;
      })
      // fetchAttachments
      .addCase(fetchAttachments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttachments.fulfilled, (state, action) => {
        state.loading = false;
        state.attachments = action.payload || [];
      })
      .addCase(fetchAttachments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addAttachment
      .addCase(addAttachmentThunk.fulfilled, (state, action) => {
        state.attachments.push(action.payload);
      })
      // deleteAttachment
      .addCase(deleteAttachmentThunk.fulfilled, (state, action) => {
        state.attachments = state.attachments.filter((a) => a.id !== action.payload);
      })
      // fetchEnrolledUsers
      .addCase(fetchEnrolledUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledUsers = action.payload || [];
      })
      .addCase(fetchEnrolledUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // enrollUser
      .addCase(enrollUserThunk.fulfilled, (state, action) => {
        state.enrolledUsers.push(action.payload);
      })
      // removeUserEnrollment
      .addCase(removeUserEnrollmentThunk.fulfilled, (state, action) => {
        state.enrolledUsers = state.enrolledUsers.filter(
          (e) =>
            !(e.assignmentId === action.payload.assignmentId && e.userId === action.payload.userId)
        );
      })
      // fetchEnrolledTeams
      .addCase(fetchEnrolledTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledTeams = action.payload || [];
      })
      .addCase(fetchEnrolledTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // enrollTeam
      .addCase(enrollTeamThunk.fulfilled, (state, action) => {
        state.enrolledTeams.push(action.payload);
      })
      // removeTeamEnrollment
      .addCase(removeTeamEnrollmentThunk.fulfilled, (state, action) => {
        state.enrolledTeams = state.enrolledTeams.filter(
          (e) =>
            !(e.assignmentId === action.payload.assignmentId && e.teamId === action.payload.teamId)
        );
      });
  },
});

export const { clearAssignmentError, clearCurrentAssignment, clearSubmissions } =
  assignmentSlice.actions;
export default assignmentSlice.reducer;
