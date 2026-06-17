// TanStack Query hooks for Teams, Users, Categories, Learning Paths

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import {
  fetchTeams,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchTeamMembers,
  addMemberToTeam,
  removeMemberFromTeam,
  fetchUsers as fetchTeamUsers,
  getAvailableUsers,
} from "@/app/services/teamService";
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/app/services/userService";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "@/app/services/categoryService";
import {
  fetchLearningPaths,
  fetchLearningPathById,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  enrollInLearningPath,
  fetchLearningPathProgress,
  getLearningPathCategories,
  fetchLearningPathStat,
  reorderLearningPathCourses,
  adminEnrollUserInLearningPath,
  adminEnrollTeamInLearningPath,
  getLearningPathEnrollments,
} from "@/app/services/learningPathService";
import { fetchDashboardStats } from "@/app/services/dashboardService";

// ─── Team Hooks ────────────────────────────────────────────

export const useTeams = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.teams.list(params),
    queryFn: () => fetchTeams(params),
  });
};

export const useTeam = (id) => {
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => fetchTeamById(id),
    enabled: !!id,
  });
};

export const useTeamMembers = (teamId) => {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: () => fetchTeamMembers(teamId),
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTeam(id, data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.teams.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.teams.all });
    },
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
};

export const useAddTeamMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => addMemberToTeam(teamId, userId),
    onSuccess: (_, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
};

export const useRemoveTeamMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => removeMemberFromTeam(teamId, userId),
    onSuccess: (_, { teamId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.teams.members(teamId) });
    },
  });
};

// ─── User Hooks ────────────────────────────────────────────

export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsers(params),
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.users.all }),
  });
};

// ─── Category Hooks ────────────────────────────────────────

export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => fetchCategories(params),
  });
};

export const useCategory = (id) => {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => fetchCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.categories.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories.all }),
  });
};

// ─── Learning Path Hooks ───────────────────────────────────

export const useLearningPaths = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.learningPaths.list(params),
    queryFn: () => fetchLearningPaths(params),
  });
};

export const useLearningPath = (id) => {
  return useQuery({
    queryKey: queryKeys.learningPaths.detail(id),
    queryFn: () => fetchLearningPathById(id),
    enabled: !!id,
  });
};

export const useLearningPathProgress = (id) => {
  return useQuery({
    queryKey: queryKeys.learningPaths.progress(id),
    queryFn: () => fetchLearningPathProgress(id),
    enabled: !!id,
  });
};

export const useLearningPathCategories = () => {
  return useQuery({
    queryKey: queryKeys.learningPaths.categories(),
    queryFn: getLearningPathCategories,
  });
};

export const useCreateLearningPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLearningPath,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.learningPaths.all }),
  });
};

export const useUpdateLearningPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateLearningPath(id, data),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.learningPaths.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.learningPaths.all });
    },
  });
};

export const useDeleteLearningPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLearningPath,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.learningPaths.all }),
  });
};

export const useEnrollInLearningPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollInLearningPath,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.learningPaths.all }),
  });
};

// ─── Dashboard Stats ───────────────────────────────────────

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.stats.dashboard(),
    queryFn: fetchDashboardStats,
    staleTime: 60_000, // 1 minute — stats don't change rapidly
  });
};
