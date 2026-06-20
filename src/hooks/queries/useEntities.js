// TanStack Query hooks for Teams, Users, Categories, Learning Paths

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
// Migrated to orval-generated hooks for teams
import {
  useTeamGetAll,
  useTeamGetByID,
  useTeamCreate,
  useTeamUpdate,
  useTeamDelete,
  useGetMembers,
  useAddMember,
  useRemoveMember,
} from "@/app/api/orval";
// Keep user fetching for now - available-users endpoint missing in orval
import {
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
// Migrated to orval-generated hooks for categories
import {
  useCategoryGetAll,
  useCategoryCreate,
  useCategoryUpdate,
  useCategoryDelete,
} from "@/app/api/orval";
// Migrated to orval-generated hooks for learning paths
import {
  useLearningPathGetAll,
  useLearningPathGetByID,
  useLearningPathCreate,
  useLearningPathUpdate,
  useLearningPathDelete,
  useLearningPathEnroll,
  useLearningPathGetProgress,
  useLearningPathAdminEnrollUser,
  useLearningPathAdminEnrollTeam,
} from "@/app/api/orval";
// Keep these functions from learning path service - not in orval or need custom handling
import {
  getLearningPathCategories,
  reorderLearningPathCourses,
  getLearningPathEnrollments,
} from "@/app/services/learningPathService";
// Migrated to orval-generated hooks
import { useStatsGet } from "@/app/api/orval";

// ─── Team Hooks (Orval-generated) ────────────────────────

export const useTeams = (params = {}) => {
  // Convert params to orval format
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;

  const result = useTeamGetAll(orvalParams);

  // Transform data to match expected format
  return {
    ...result,
    data: result.data?.data ? { teams: result.data.data, total: result.data.data.length } : { teams: [], total: 0 },
  };
};

export const useTeam = (id) => {
  const result = useTeamGetByID(id);

  return {
    ...result,
    enabled: !!id,
  };
};

export const useTeamMembers = (teamId) => {
  const result = useGetMembers(teamId);

  return {
    ...result,
    data: result.data?.data || [],
    enabled: !!teamId,
  };
};

export const useCreateTeam = () => {
  const qc = useQueryClient();
  const orvalMutation = useTeamCreate();

  return {
    ...orvalMutation,
    mutate: async (data) => {
      // Orval expects { data: DomainTeam }
      return orvalMutation.mutateAsync({ data });
    },
    mutateAsync: async (data) => {
      return orvalMutation.mutateAsync({ data });
    },
  };
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  const orvalMutation = useTeamUpdate();

  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: DomainTeam }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  const orvalMutation = useTeamDelete();

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

export const useAddTeamMember = () => {
  const qc = useQueryClient();
  const orvalMutation = useAddMember();

  return {
    ...orvalMutation,
    mutate: async ({ teamId, userId }) => {
      // Orval expects { id: number; data: DomainTeamMember }
      return orvalMutation.mutateAsync({ id: teamId, data: { userId } });
    },
    mutateAsync: async ({ teamId, userId }) => {
      return orvalMutation.mutateAsync({ id: teamId, data: { userId } });
    },
  };
};

export const useRemoveTeamMember = () => {
  const qc = useQueryClient();
  const orvalMutation = useRemoveMember();

  return {
    ...orvalMutation,
    mutate: async ({ teamId, userId }) => {
      // Orval expects { id: number; userId: number }
      return orvalMutation.mutateAsync({ id: teamId, userId });
    },
    mutateAsync: async ({ teamId, userId }) => {
      return orvalMutation.mutateAsync({ id: teamId, userId });
    },
  };
};

// Keep the user fetching hooks as-is since orval doesn't have available-users endpoint
export const useFetchTeamUsers = (params = {}) => {
  return useQuery({
    queryKey: ["teamUsers", params],
    queryFn: () => fetchTeamUsers(params),
  });
};

export const useAvailableUsers = (teamId) => {
  return useQuery({
    queryKey: ["availableUsers", teamId],
    queryFn: () => getAvailableUsers(teamId),
    enabled: !!teamId,
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

// ─── Learning Path Hooks (Orval-generated) ─────────────────

export const useLearningPaths = (params = {}) => {
  const orvalParams = {};
  if (params.page !== undefined) orvalParams.page = params.page;
  if (params.limit !== undefined) orvalParams.limit = params.limit;
  if (params.search !== undefined) orvalParams.search = params.search;
  if (params.category !== undefined && params.category !== "all") orvalParams.category = params.category;
  if (params.status !== undefined && params.status !== "all") orvalParams.status = params.status;

  const result = useLearningPathGetAll(orvalParams);

  // Transform data to match expected format
  return {
    ...result,
    data: result.data?.data || result.data || { paths: [], total: 0, page: 1, limit: 6, totalPages: 1 },
  };
};

export const useLearningPath = (id) => {
  const result = useLearningPathGetByID(id);

  return {
    ...result,
    enabled: !!id,
  };
};

export const useLearningPathProgress = (id) => {
  const result = useLearningPathGetProgress(id);

  return {
    ...result,
    enabled: !!id,
  };
};

export const useLearningPathCategories = () => {
  return useQuery({
    queryKey: queryKeys.learningPaths.categories(),
    queryFn: getLearningPathCategories,
  });
};

export const useCreateLearningPath = () => {
  const qc = useQueryClient();
  const orvalMutation = useLearningPathCreate();

  return {
    ...orvalMutation,
    mutate: async (data) => {
      // Orval expects { data: DomainCreateLearningPathRequest }
      return orvalMutation.mutateAsync({ data });
    },
    mutateAsync: async (data) => {
      return orvalMutation.mutateAsync({ data });
    },
  };
};

export const useUpdateLearningPath = () => {
  const qc = useQueryClient();
  const orvalMutation = useLearningPathUpdate();

  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: DomainUpdateLearningPathRequest }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

export const useDeleteLearningPath = () => {
  const qc = useQueryClient();
  const orvalMutation = useLearningPathDelete();

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

export const useEnrollInLearningPath = () => {
  const qc = useQueryClient();
  const orvalMutation = useLearningPathEnroll();

  return {
    ...orvalMutation,
    mutate: async (id) => {
      // Orval expects just the id as a parameter, not wrapped
      return orvalMutation.mutateAsync({ id });
    },
    mutateAsync: async (id) => {
      return orvalMutation.mutateAsync({ id });
    },
  };
};

// Keep admin enroll functions as they use the service for now
export const useAdminEnrollUserInLearningPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ learningPathId, userId }) => adminEnrollUserInLearningPath(learningPathId, userId),
    onSuccess: (_, { learningPathId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(learningPathId) });
    },
  });
};

export const useAdminEnrollTeamInLearningPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ learningPathId, teamId }) => adminEnrollTeamInLearningPath(learningPathId, teamId),
    onSuccess: (_, { learningPathId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(learningPathId) });
    },
  });
};

export const useReorderLearningPathCourses = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, courses }) => reorderLearningPathCourses(id, courses),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.learningPaths.detail(id) });
    },
  });
};

export const useGetLearningPathEnrollments = (learningPathId) => {
  return useQuery({
    queryKey: queryKeys.learningPaths.enrollments(learningPathId),
    queryFn: () => getLearningPathEnrollments(learningPathId),
    enabled: !!learningPathId,
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
