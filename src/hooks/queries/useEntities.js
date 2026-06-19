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
// Migrated to orval-generated hooks
import {
  useCategoryGetAll,
  useCategoryCreate,
  useCategoryUpdate,
  useCategoryDelete,
} from "@/app/api/orval";
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
// Migrated to orval-generated hooks
import { useStatsGet } from "@/app/api/orval";

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

// ─── Category Hooks (Orval-generated) ────────────────────

export const useCategories = (params = {}) => {
  // Convert params to orval format if needed
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;
  
  const result = useCategoryGetAll(orvalParams);
  
  // Orval returns the full response, we need to extract the data
  // The custom fetcher handles the { message, data } envelope unwrapping
  return {
    ...result,
    data: result.data?.data || [], // Extract categories array from response
  };
};

export const useCategory = (id) => {
  // For single category, we need to implement using the base query
  // Orval doesn't have a specific get by ID hook, so we'll use the getAll with filter
  // This is a limitation - we may need to add a custom hook or use the base function
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async () => {
      // Fallback to manual implementation since orval doesn't have get by ID
      const { apiGet } = await import("@/app/services/http");
      return apiGet(`/categories/${id}`);
    },
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  const orvalMutation = useCategoryCreate();
  
  return {
    ...orvalMutation,
    mutate: async (data) => {
      // Orval expects { data: DomainCategory }
      return orvalMutation.mutateAsync({ data });
    },
    mutateAsync: async (data) => {
      return orvalMutation.mutateAsync({ data });
    },
  };
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  const orvalMutation = useCategoryUpdate();
  
  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: DomainCategory }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  const orvalMutation = useCategoryDelete();
  
  return {
    ...orvalMutation,
    mutate: async (id) => {
      // Orval expects { id: number }
      return orvalMutation.mutateAsync({ id });
    },
    mutateAsync: async (id) => {
      return orvalMutation.mutateAsync({ id });
    },
  };
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

// ─── Dashboard Stats (Orval-generated) ───────────────────

export const useDashboardStats = () => {
  const result = useStatsGet({
    query: {
      staleTime: 60_000, // 1 minute — stats don't change rapidly
    },
  });
  return result;
};
