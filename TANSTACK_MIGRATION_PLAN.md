# TanStack Query (React Query) Adoption Plan for MeroEdu Frontend

## Executive Summary

The current frontend uses a **hand-rolled data fetching architecture** combining Redux Toolkit (thunks + slices), custom hooks (`useApi`, `useAsyncData`, `useListData`), and direct `useState`/`useEffect` patterns in components. This plan proposes migrating to **TanStack Query (React Query)** as the unified data-fetching layer, which will dramatically reduce boilerplate, eliminate entire categories of bugs, and provide features we currently lack (caching, background refetching, optimistic updates, pagination).

---

## Current Architecture Analysis

### What We Have Today

**1. Service Layer** (`src/app/services/`)

- 15 service files wrapping `fetch` calls via a centralized `http.js` client
- Each service exports plain async functions like `fetchCourses()`, `createCourse()`, `publishCourse()`
- Services handle request/response envelope unwrapping and field normalization
- **Problem**: Services know about both data fetching AND data transformation. No caching, no deduplication, no retry logic.

**2. Redux Toolkit** (`src/redux/slices/`)

- 6 slices: auth, assignments, courseBuilder, enrollments, learningPaths, test
- Each slice defines `createAsyncThunk` wrappers around service functions
- Manual `pending`/`fulfilled`/`rejected` state management with loading/error flags
- **Problem**: ~150 lines of boilerplate per slice for what is essentially `useQuery`/`useMutation`. The Redux store is used as a poor-man's cache with no TTL, no background refresh, and no automatic invalidation.

**3. Custom Hooks** (`src/hooks/`)

- `useApi` — generic async call wrapper with loading/error state
- `useAsyncData` — single-item fetch with immediate/deferred options
- `useListData` — list fetch with search/filter/pagination state
- **Problem**: These reimplement what TanStack Query does out of the box, but without caching, deduplication, stale-while-revalidate, or automatic refetching. Every component mount triggers a new API call even if the data was fetched 2 seconds ago.

**4. Direct useState/useEffect** (in components like `Course.jsx`, `CourseDetail.jsx`)

- Components manually call services in `useEffect`, manage their own loading/error state
- Pagination, search debouncing, and filter state managed manually via `useSearchParams`
- **Problem**: No caching at all. Navigating away and back re-fetches everything. No optimistic updates. No error retry.

### Pain Points in Current Architecture

| Pain Point                               | Current Impact                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **No caching**                           | Every page navigation re-fetches all data. Course list re-fetches when switching tabs.                                   |
| **No automatic refetching**              | After creating a course, the list doesn't update unless manually refreshed.                                              |
| **No optimistic updates**                | After publishing a course, the UI shows loading spinner until the API responds, then manually updates state.             |
| **No request deduplication**             | If two components mount simultaneously and both call `fetchCourses()`, two identical API calls fire.                     |
| **No retry logic**                       | Network failures require manual retry (user clicks "Retry" button).                                                      |
| **No background stale-while-revalidate** | Data is either fresh (loading) or stale (no refresh). No serving stale data while fetching fresh.                        |
| **Massive Redux boilerplate**            | ~150 lines per slice for async thunks + reducers. 6 slices = ~900 lines of boilerplate.                                  |
| **Inconsistent patterns**                | Some pages use Redux thunks, some use custom hooks, some use direct useState. Three different ways to do the same thing. |
| **No pagination support**                | `useListData` handles client-side pagination only. No cursor/offset-based server pagination with caching.                |
| **No infinite scroll**                   | Would require building from scratch.                                                                                     |
| **Manual cache invalidation**            | After `createCourse()`, must manually call `refetch()` or dispatch an action to update the list.                         |

---

## Proposed Architecture with TanStack Query

### Layer Structure

```
┌─────────────────────────────────────────────────────┐
│                   Components                         │
│  useCourses(), useCourse(id), usePublishCourse()    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              TanStack Query Layer                     │
│  useQuery() / useMutation() / useInfiniteQuery()    │
│  Automatic caching, retry, dedup, refetch           │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Service Layer (unchanged)                │
│  fetchCourses(), createCourse(), publishCourse()    │
│  Pure async functions, no state management          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              HTTP Client (unchanged)                  │
│  apiGet(), apiPost(), apiPut(), apiDelete()         │
│  Auth injection, envelope unwrapping                │
└─────────────────────────────────────────────────────┘
```

### What Changes

**Service Layer** — No changes needed. Services remain pure async functions.

**HTTP Client** — No changes needed. `http.js` stays as-is.

**Redux** — Drastically reduced. Only `auth` slice remains (user session, token, permissions). All data-fetching slices removed.

**Custom Hooks** — Removed. `useApi`, `useAsyncData`, `useListData` replaced by `useQuery`/`useMutation`.

**Components** — Simplified. Instead of `useEffect` + `useState` + manual fetch, components call `useQuery` hooks.

### What Stays in Redux

Only **auth state** remains in Redux:

- `user` object
- `token`
- `isAuthenticated`
- Permission helpers (`hasPermission`)

Everything else (courses, lessons, enrollments, assignments, events, notifications, teams, users, categories, learning paths) moves to TanStack Query.

---

## Detailed Migration Plan

### Phase 1: Foundation (Week 1)

**1.1 Install dependencies**

```
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

**1.2 Set up QueryClient provider** in `App.jsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

// Wrap existing providers:
<QueryClientProvider client={queryClient}>
  <Provider store={store}>
    <App />
  </Provider>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>;
```

**1.3 Create query key factory** (`src/lib/queryKeys.ts`):

```tsx
export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    list: (params) => ["courses", "list", params] as const,
    detail: (id) => ["courses", "detail", id] as const,
    lessons: (id) => ["courses", "lessons", id] as const,
    progress: (id) => ["courses", "progress", id] as const,
    enrollments: (id) => ["courses", "enrollments", id] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    list: (lessonId) => ["assignments", "list", lessonId] as const,
    detail: (id) => ["assignments", "detail", id] as const,
    submissions: (id) => ["assignments", "submissions", id] as const,
  },
  // ... similar for events, notifications, teams, users, categories, learningPaths
};
```

**1.4 Create shared hooks** (`src/hooks/queries/`):

Example — `src/hooks/queries/useCourses.ts`:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  fetchCourses,
  fetchCourseById,
  createCourse,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse,
} from "@/app/services/courseService";

export const useCourses = (params) => {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => fetchCourses(params),
    placeholderData: (prev) => prev, // keep previous data while fetching new page
  });
};

export const useCourse = (id) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => fetchCourseById(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const usePublishCourse = () => {
  return useMutation({
    mutationFn: publishCourse,
    onSuccess: (data) => {
      // Update the specific course cache
      qc.setQueryData(queryKeys.courses.detail(data.id), data);
      // Invalidate list queries so they refetch
      qc.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

// Similar for updateCourse, archiveCourse, deleteCourse, restoreCourse...
```

### Phase 2: Migrate Course Pages (Week 2)

**2.1 Course List** (`Course.jsx`)

- Replace `useState` + `useEffect` + `fetchData` with `useCourses(params)`
- Replace manual pagination with `keepPreviousData`
- Search/filter params stay in URL via `useSearchParams` (unchanged)
- **Before**: 319 lines with manual state management
- **After**: ~120 lines, zero manual loading/error/caching code

**2.2 Course Detail** (`CourseDetail.jsx`)

- Replace `useCallback` + `useEffect` + `Promise.all` with:
  - `useCourse(id)` — course data
  - `useLessons(id)` — lessons list
  - `useEnrollmentStatus(id)` — enrollment
- Replace `handlePublish`/`handleArchive`/`handleRestore` with `usePublishCourse()`/`useArchiveCourse()`/`useRestoreCourse()` mutations
- **Before**: 683 lines with manual data loading, action handlers with try/catch/finally
- **After**: ~350 lines, mutations handle loading/error automatically

**2.3 Course Create/Edit** (`CourseCreate.jsx`, `CourseEdit.jsx`)

- Replace `onSubmit` handlers with `useCreateCourse()`/`useUpdateCourse()` mutations
- Navigation after success handled in `onSuccess` callback
- Form state management stays the same (form data is local UI state, not server state)

### Phase 3: Migrate Remaining Modules (Week 3)

**3.1 Lessons** — `useLessons(id)`, `useCreateLesson()`, `useUpdateLesson()`, `useReorderLessons()`
**3.2 Enrollments** — `useEnrollments()`, `useEnrollInCourse()`, `useMarkLessonComplete()`
**3.3 Assignments** — Replace `assignmentSlice` Redux with `useAssignments()`, `useSubmissions()`, `useGradeSubmission()`
**3.4 Events** — Replace mock-based `eventService` hooks with real `useEvents()`, `useCreateEvent()`, `useEventAttendees()`
**3.5 Notifications** — `useNotifications()`, `useMarkAsRead()`, `useMarkAllAsRead()`
**3.6 Teams** — `useTeams()`, `useTeamMembers()`, `useAddMember()`
**3.7 Users** — `useUsers()`, `useUser(id)`, `useUpdateUser()`
**3.8 Categories** — `useCategories()`, `useCreateCategory()`
**3.9 Learning Paths** — `useLearningPaths()`, `useLearningPath(id)`, `useEnrollInLearningPath()`

### Phase 4: Remove Redux Data Slices (Week 4)

**4.1 Remove Redux slices**:

- Delete `assignmentSlice.js`, `enrollmentSlice.js`, `learningPathSlice.js`, `courseBuilderSlice.js`, `testSlice.js`
- Keep only `authSlice.js`

**4.2 Remove custom hooks**:

- Delete `useApi.js`, `useAsyncData.js`, `useListData.js`
- Keep `usePageTitle.js`, `useUnsavedChanges.js`, `useFormField.js`, `useConfirmation.js`, `useAuthenticatedMediaUrl.js`, `usePagination.js` (these are UI utilities, not data fetching)

**4.3 Simplify store** (`store.js`):

```tsx
const store = configureStore({
  reducer: {
    auth: authReducer, // only auth remains
  },
});
```

**4.4 Remove unused dependencies**:

- `redux-thunk` (no longer needed — auth slice uses plain actions)

---

## Feature Comparison

| Feature                         | Current                                 | TanStack Query                                                          |
| ------------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| **Caching**                     | None. Every mount re-fetches.           | Automatic, configurable TTL per query.                                  |
| **Stale-while-revalidate**      | Not supported.                          | Built-in. Shows stale data while fetching fresh.                        |
| **Request deduplication**       | None. Two components = two API calls.   | Automatic. Same key = single request.                                   |
| **Retry on failure**            | Manual (user clicks Retry).             | Automatic with configurable count + backoff.                            |
| **Optimistic updates**          | Not supported.                          | Built-in via `onMutate` + `setQueryData`.                               |
| **Cache invalidation**          | Manual `refetch()` calls.               | Automatic via `invalidateQueries()` by key pattern.                     |
| **Background refetch on focus** | Not supported.                          | Built-in, configurable.                                                 |
| **Pagination**                  | Manual `useSearchParams` + client-side. | `useInfiniteQuery` with cursor/offset support.                          |
| **Dependent queries**           | Manual `Promise.all` in `useEffect`.    | `enabled: !!id` — declarative dependency.                               |
| **Loading/error states**        | Manual `useState` per component.        | Built into every `useQuery`/`useMutation`.                              |
| **DevTools**                    | Redux DevTools (shows every action).    | React Query DevTools (cache inspector, query status, refetch triggers). |
| **Bundle size**                 | Redux + RTK + thunk = ~11KB.            | TanStack Query = ~13KB. Net +2KB for vastly more capability.            |
| **Boilerplate**                 | ~150 lines per Redux slice.             | ~10 lines per `useQuery` hook.                                          |
| **Type safety**                 | Manual thunk typing.                    | Full TypeScript inference from queryFn return type.                     |

---

## Code Comparison: Before vs After

### Example: Course List Page

**Before** (current `Course.jsx` — 319 lines):

```tsx
const [courses, setCourses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [totalPages, setTotalPages] = useState(1);
const [total, setTotal] = useState(0);

const fetchData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchCourses({ search, status, category, sort, page, limit });
    setCourses(data.courses);
    setTotalPages(data.totalPages);
    setTotal(data.total);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [search, status, category, sort, page, viewMode]);

useEffect(() => {
  fetchData();
}, [fetchData]);

const refreshList = useCallback(() => {
  fetchData();
}, [fetchData]);
// ... manual debounced search, manual pagination, manual error/loading rendering
```

**After** (with TanStack Query — ~80 lines):

```tsx
const { data, isLoading, error } = useCourses({ search, status, category, sort, page, limit });
const courses = data?.courses ?? [];
const totalPages = data?.totalPages ?? 1;
const total = data?.total ?? 0;
// That's it. Caching, retry, dedup, background refetch — all automatic.
```

### Example: Publish Course Action

**Before** (current `CourseDetail.jsx`):

```tsx
const handlePublish = async () => {
  try {
    setActionLoading(true);
    const updated = await publishCourse(id);
    setCourse(updated);
    addToast("Course published successfully!", "success");
  } catch (err) {
    addToast(err.message || "Failed to publish course", "error");
  } finally {
    setActionLoading(false);
    setActiveModal(null);
  }
};
```

**After** (with TanStack Query):

```tsx
const publishMutation = usePublishCourse();

const handlePublish = () => {
  publishMutation.mutate(id, {
    onSuccess: () => {
      addToast("Course published successfully!", "success");
      setActiveModal(null);
    },
    onError: (err) => {
      addToast(err.message || "Failed to publish course", "error");
    },
  });
};
// publishMutation.isLoading replaces setActionLoading
// Cache invalidation happens automatically in the hook
```

### Example: Course Detail with Multiple Queries

**Before** (current `CourseDetail.jsx`):

```tsx
const loadData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const [courseData, lessonsData, enrollmentData] = await Promise.all([
      fetchCourseById(id),
      fetchLessons(id),
      user ? getEnrollmentStatus(parseInt(id)) : Promise.resolve(null),
    ]);
    setCourse(courseData);
    setLessons(lessonsData || []);
    setEnrollment(enrollmentData);
    if (canManageEnrollments) {
      const [enrollmentsData, counts] = await Promise.all([
        getCourseEnrollments(parseInt(id)).catch(() => []),
        getLessonCompletionCounts(parseInt(id)),
      ]);
      setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      setLessonCompletionCounts(counts);
    }
  } catch (err) {
    setError(err.message || "Failed to load course");
  } finally {
    setLoading(false);
  }
}, [id, user, canManageEnrollments]);

useEffect(() => {
  loadData();
}, [loadData]);
```

**After** (with TanStack Query):

```tsx
const { data: course, isLoading: courseLoading } = useCourse(id);
const { data: lessons } = useLessons(id, { enabled: !!id });
const { data: enrollment } = useEnrollmentStatus(id, { enabled: !!user });
const { data: enrollments } = useCourseEnrollments(id, { enabled: canManageEnrollments });
const { data: completionCounts } = useLessonCompletionCounts(id, { enabled: canManageEnrollments });

const isLoading = courseLoading;
// Each query caches independently. Lessons cache persists across navigation.
// Enrollment status refetches automatically when window regains focus.
// No manual Promise.all, no manual error/loading state.
```

---

## Risk Mitigation

### Risk: Learning Curve

**Mitigation**: TanStack Query has excellent documentation and is widely adopted (used by 50%+ of React projects). The API surface for our use case is small: `useQuery`, `useMutation`, `useQueryClient`, `queryKeys`.

### Risk: Breaking Changes During Migration

**Mitigation**: Phase-based approach. Each module is migrated independently. Old Redux thunks and new TanStack Query hooks can coexist during migration.

### Risk: Over-fetching

**Mitigation**: Configure `staleTime` appropriately. Course list: 30s. Course detail: 60s. User profile: 5 minutes. This prevents unnecessary refetches while keeping data fresh.

### Risk: Cache Staleness After Mutations

**Mitigation**: Use `invalidateQueries()` in mutation `onSuccess` callbacks. This is actually MORE reliable than our current manual approach where we often forget to update related caches.

---

## Estimated Impact

| Metric                                   | Before                                | After                               | Improvement              |
| ---------------------------------------- | ------------------------------------- | ----------------------------------- | ------------------------ |
| **Lines of data-fetching code**          | ~2,500 (slices + hooks + components)  | ~800 (query hooks only)             | **68% reduction**        |
| **Redux store slices**                   | 6                                     | 1 (auth only)                       | **83% reduction**        |
| **Custom data hooks**                    | 3 (useApi, useAsyncData, useListData) | 0 (replaced by TanStack)            | **100% reduction**       |
| **API calls on page navigation**         | All data re-fetches                   | Only stale data refetches           | **~70% fewer API calls** |
| **Time to implement new list page**      | ~4 hours (slice + hook + component)   | ~1 hour (useQuery + component)      | **75% faster**           |
| **Bug class: stale data after mutation** | Common (manual cache updates)         | Eliminated (automatic invalidation) | **Zero bugs**            |
| **Bug class: duplicate API calls**       | Common (no dedup)                     | Eliminated (automatic dedup)        | **Zero bugs**            |
| **Bug class: missing loading state**     | Common (forgotten in new components)  | Impossible (built into useQuery)    | **Zero bugs**            |

---

## Recommendation

**Proceed with Phase 1 immediately.** The foundation (QueryClient setup + query key factory + first few hooks) can be done in 1-2 days and delivers value immediately. Each subsequent phase is independent and can be scheduled based on team capacity.

The migration is low-risk because:

1. Service layer doesn't change
2. HTTP client doesn't change
3. Components change minimally (replace `useEffect`+`useState` with `useQuery`)
4. Old and new patterns can coexist during migration
5. Each migrated module is a self-contained unit of work
