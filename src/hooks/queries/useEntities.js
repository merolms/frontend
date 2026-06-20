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
  useTeamGetStat,
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
  useCategoryGetByID,
  useCategoryCreate,
  useCategoryUpdate,
  useCategoryDelete,
  useCategoryGetChildren,
  useCategoryGetRoots,
  useCategoryGetStat,
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
// Enrollment hooks - orval-generated
import {
  useEnrollmentAdminEnrollTeam,
  useEnrollmentAdminEnrollUser,
  useEnrollmentDrop,
  useEnrollmentEnroll,
  useEnrollmentGet,
  useEnrollmentGetProgress,
} from "@/app/api/orval";
// Certificate hooks - orval-generated
import {
  useCertificateGet,
  useCertificateUpdate,
  useCertificateDelete,
} from "@/app/api/orval";
// Notification hooks - orval-generated
import {
  useNotificationGet,
  useNotificationCreate,
  useNotificationDelete,
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

  // The custom fetcher unwraps { message, data } envelope
  // Orval's response structure: { data: DomainTeam[] }
  // Component expects array directly, but we can provide both for compatibility
  return {
    ...result,
    data: result.data || result.data?.data || [], // Return array directly for components
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

export const useTeamStat = () => {
  const result = useTeamGetStat();
  
  return {
    ...result,
    data: result.data?.data,
  };
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

// ─── Course Analytics & Prerequisites (Orval-generated) ─────────

// Note: The following hooks are available from @/app/api/orval
// Use them directly in components:
// - useGetCourseInsights
// - useGetCourseProgress  
// - useCreateCoursePrerequisite
// - useDeleteCoursePrerequisite
// - useEnrollTeam
// - useRemoveTeamEnrollment
// - useSubmitTeam
// - useCreateContentRevision
// - useDeleteContentRevision
// - useGetCourseCertificates
// - useGetCourseEvents
// - useGetCourseForums
// - useGetInvitationsByCourse
// - useReorderCourses

// ─── Category Hooks (Orval-generated) ────────────────────

export const useCategories = (params = {}) => {
  // Convert params to orval format if needed
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;
  
  const result = useCategoryGetAll(orvalParams);
  
  // The custom fetcher unwraps { message, data } envelope
  // Orval's response structure: { data: DomainCategory[] }
  return result
  return {
    ...result,
    data: result.data || [], // Handle both wrapped and unwrapped data
  };
};

export const useCategory = (id) => {
  const result = useCategoryGetByID(id);
  
  return {
    ...result,
    data: result.data?.data,
    enabled: !!id,
  };
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

export const useCategoryChildren = (parentId) => {
  const result = useCategoryGetChildren(parentId);
  
  return {
    ...result,
    data: result.data?.data || [],
    enabled: !!parentId,
  };
};

export const useCategoryRoots = (params = {}) => {
  const orvalParams = {};
  if (params.start !== undefined) orvalParams.start = params.start;
  if (params.limit !== undefined) orvalParams.limit = params.limit;
  
  const result = useCategoryGetRoots(orvalParams);
  
  return {
    ...result,
    data: result.data?.data || [],
  };
};

export const useCategoryStat = () => {
  const result = useCategoryGetStat();
  
  return {
    ...result,
    data: result.data?.data,
  };
};

export const useSetCategoryParent = () => {
  const qc = useQueryClient();
  const orvalMutation = useCategorySetParent();
  
  return {
    ...orvalMutation,
    mutate: async ({ id, parentId }) => {
      // Orval expects { id: number; data: { parentId: number } }
      return orvalMutation.mutateAsync({ id, data: { parentId } });
    },
    mutateAsync: async ({ id, parentId }) => {
      return orvalMutation.mutateAsync({ id, data: { parentId } });
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

// ─── Enrollment Hooks (Orval-generated) ─────────────────────

export const useEnrollment = (id) => {
  const result = useEnrollmentGet(id);
  
  return {
    ...result,
    data: result.data?.data,
    enabled: !!id,
  };
};

export const useEnrollmentProgress = (id) => {
  const result = useEnrollmentGetProgress(id);
  
  return {
    ...result,
    data: result.data?.data,
    enabled: !!id,
  };
};

export const useEnrollInCourse = () => {
  const qc = useQueryClient();
  const orvalMutation = useEnrollmentEnroll();
  
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

export const useDropFromCourse = () => {
  const qc = useQueryClient();
  const orvalMutation = useEnrollmentDrop();
  
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

export const useAdminEnrollUserInCourse = () => {
  const qc = useQueryClient();
  const orvalMutation = useEnrollmentAdminEnrollUser();
  
  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: HttpAdminEnrollRequest }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

export const useAdminEnrollTeamInCourse = () => {
  const qc = useQueryClient();
  const orvalMutation = useEnrollmentAdminEnrollTeam();
  
  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: HttpAdminEnrollTeamRequest }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

// ─── Certificate Hooks (Orval-generated) ─────────────────────

export const useCertificate = (id) => {
  const result = useCertificateGet(id);
  
  return {
    ...result,
    data: result.data?.data,
    enabled: !!id,
  };
};

export const useUpdateCertificate = () => {
  const qc = useQueryClient();
  const orvalMutation = useCertificateUpdate();
  
  return {
    ...orvalMutation,
    mutate: async ({ id, data }) => {
      // Orval expects { id: number; data: DomainCertificate }
      return orvalMutation.mutateAsync({ id, data });
    },
    mutateAsync: async ({ id, data }) => {
      return orvalMutation.mutateAsync({ id, data });
    },
  };
};

export const useDeleteCertificate = () => {
  const qc = useQueryClient();
  const orvalMutation = useCertificateDelete();
  
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

// ─── Notification Hooks (Orval-generated) ───────────────────

export const useNotification = (id) => {
  const result = useNotificationGet(id);
  
  return {
    ...result,
    data: result.data?.data,
    enabled: !!id,
  };
};

export const useCreateNotification = () => {
  const qc = useQueryClient();
  const orvalMutation = useNotificationCreate();
  
  return {
    ...orvalMutation,
    mutate: async (data) => {
      // Orval expects { data: DomainNotification }
      return orvalMutation.mutateAsync({ data });
    },
    mutateAsync: async (data) => {
      return orvalMutation.mutateAsync({ data });
    },
  };
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  const orvalMutation = useNotificationDelete();
  
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
