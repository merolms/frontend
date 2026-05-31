# 30-Day Frontend Improvement Plan

## Project: mero-edu-ui

**Target:** Modernize the ReactJS frontend for the educational platform
**Status:** Planning Phase

---

## Executive Summary

This plan outlines 30 days of targeted improvements to the **mero-edu-ui** frontend, focusing on architecture, performance, developer experience, and security. The current codebase is functional but needs systematic refactoring to scale and maintain.

---

## Current State Assessment

| Area               | Status | Issues                                                  |
| ------------------ | ------ | ------------------------------------------------------- |
| **Architecture**   | ❌     | No FSD, monolithic components, no lazy loading          |
| **Performance**    | ⚠️     | Large initial bundle, no virtualization, no memoization |
| **DX**             | ⚠️     | No TypeScript, minimal docs, no Storybook               |
| **Security**       | ⚠️     | localStorage auth, no input sanitization                |
| **Testing**        | ⚠️     | Playwright exists but 0 E2E tests                       |
| **Error Handling** | ❌     | No error boundaries, no global tracking                 |

---

## Detailed Work Breakdown

### Phase 1: Foundation (Week 1)

**Goal:** Prevent silent failures, reduce bundle size

| Day | Task                                                                                                                | Effort | Impact | Quick Win |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------ | ------ | --------- |
| 1   | **Add Error Boundary** — Wrap `App.jsx` with custom `<ErrorBoundary>` component                                     | 2h     | Medium | ✅        |
| 2   | **Add Global Error Tracking** — Integrate Sentry or LogRocket SDK                                                   | 3h     | High   | ✅        |
| 3-4 | **Lazy Load Routes** — Replace all `element: <Component />` with `element: lazy(() => import(...))` in `Routes.jsx` | 4h     | High   | ✅        |
| 5   | **Code Split by View Mode** — Lazy load `CourseTable`, `CourseGrid`, `CourseCompactView`                            | 2h     | Medium | ❌        |
| 6-7 | **TypeScript for Core APIs** — Add JSDoc types to `http.js`, `Routes.jsx`, `ProtectedRoute.jsx`                     | 6h     | Medium | ❌        |

**Expected Outcome:** 60-80% smaller initial bundle, no silent crashes, professional error tracking

---

### Phase 2: Architecture (Week 2)

**Goal:** Refactor monolithic components into feature-sliced architecture

| Day | Task                                                          | Effort | Impact | Quick Win |
| --- | ------------------------------------------------------------- | ------ | ------ | --------- |
| 1-3 | **Feature-Sliced Refactor: Courses** — Move to FSD structure: |

```
src/features/courses/ui/       CourseList, CourseCard, CourseTable
src/features/courses/widgets/  CourseBuilder, CoursePreview
src/features/courses/pages/    CourseContainer, CourseDetail
src/features/courses/model/    courseSlice, courseApi, selectors
```

| 12h | High | ❌ |
| 4-5 | **Create Shared UI Library** — Extract `Button`, `Input`, `Select`, `Modal`, `Table`, `Card` to `src/shared/ui/` | 8h | Medium | ❌ |
| 6-7 | **Storybook Setup** — Document `Button`, `CourseTable`, `CourseBuilder` with interactive stories | 6h | Medium | ❌ |

**Expected Outcome:** Scalable architecture, documented UI components, reusable shared library

---

### Phase 3: Performance (Week 3)

**Goal:** Optimize render speed and memory usage

| Day | Task                                                                                                                         | Effort | Impact | Quick Win |
| --- | ---------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | --------- |
| 1-2 | **Virtualize Long Lists** — Implement `react-window` or `tanstack-virtual` for course lists, user tables, event lists        | 8h     | High   | ❌        |
| 3-4 | **Memoize Expensive Components** — Add `React.memo` to `Dashboard`, `CourseTable`, `CourseGrid`; use `useMemo`/`useCallback` | 4h     | Medium | ❌        |
| 5-7 | **React Query Migration** — Replace manual `apiGet`/`apiPost` with RTK Query in `features/users/`                            | 12h    | High   | ❌        |

**Expected Outcome:** 5-10x faster rendering on 100+ row lists, proper caching and loading states

---

### Phase 4: Polish (Week 4)

**Goal:** Security, UX, and production readiness

| Day | Task                                                                                  | Effort | Impact | Quick Win |
| --- | ------------------------------------------------------------------------------------- | ------ | ------ | --------- |
| 1-2 | **Input Sanitization** — Add DOMPurify to BlockNote editor; sanitize all user content | 3h     | High   | ✅        |
| 3-4 | **Optimistic UI** — Implement optimistic updates for course creation/edits            | 6h     | Medium | ❌        |
| 5-7 | **Playwright E2E Tests** — Write 3 critical flows:                                    |

1. Login → Dashboard → Create Course → Add Lesson → Preview
2. User CRUD → Role assignment → Permission check
3. Team invite → Join team → View team courses

| 12h | High | ❌ |

**Expected Outcome:** XSS prevention, snappy UX, automated regression testing

---

## Top 3 Quick Wins (Do Today)

### 1. Add Error Boundary 🚀

**Why:** Prevents entire app crash from one component failure
**Effort:** 30 lines
**Impact:** Prevents user data loss

```jsx
// src/app/components/ErrorBoundary.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary rounded px-4 py-2 text-white"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
```

### 2. Lazy Load Routes 🚀

**Why:** 60-80% smaller initial bundle
**Effort:** Replace 20 imports
**Impact:** Faster first paint

```jsx
// In Routes.jsx
const CourseContainer = lazy(() => import("@/app/containers/course/Course"));
const UserContainer = lazy(() => import("@/app/containers/user/User"));
const TeamContainer = lazy(() => import("@/app/containers/team/Team"));
```

### 3. Input Sanitization 🚀

**Why:** Prevents XSS attacks
**Effort:** 10 lines + npm install
**Impact:** Security vulnerability fix

```bash
npm install dompurify
```

```jsx
// In CourseBuilder.jsx
import DOMPurify from "dompurify";

const sanitizeContent = (html) =>
  DOMPurify.sanitize(html, { ALLOWED_TAGS: ["p", "h1", "h2", "ul", "ol", "li", "a", "img"] });
const savedContent = sanitizeContent(editorState.content);
```

---

## Impact Matrix

| Priority                    | Effort | Impact | ROI        |
| --------------------------- | ------ | ------ | ---------- |
| Lazy load routes            | Low    | High   | ⭐⭐⭐⭐⭐ |
| Error boundaries            | Low    | Medium | ⭐⭐⭐⭐   |
| Input sanitization          | Low    | High   | ⭐⭐⭐⭐⭐ |
| Feature-sliced architecture | Medium | High   | ⭐⭐⭐⭐   |
| React Query migration       | High   | High   | ⭐⭐⭐⭐   |
| Virtualize lists            | Medium | High   | ⭐⭐⭐⭐   |
| Storybook                   | Medium | Medium | ⭐⭐⭐     |
| TypeScript                  | High   | Medium | ⭐⭐       |

---

## Rollout Dependencies

```
Week 1 (Foundation)
└─ Week 2 (Architecture) ← Depends on lazy-loaded routes for faster builds
└─ Week 3 (Performance) ← Depends on feature-sliced structure
└─ Week 4 (Polish) ← Can run in parallel with Week 3
```

---

## Success Metrics

| Metric                 | Current        | Target (Day 30)    | Measurement             |
| ---------------------- | -------------- | ------------------ | ----------------------- |
| Initial Bundle Size    | ~500KB         | <200KB             | Webpack Bundle Analyzer |
| Lighthouse Performance | ~60            | >90                | Lighthouse CI           |
| Error Rate             | Silent crashes | <0.1%              | Sentry Dashboard        |
| Bundle Runtime         | 2-3s           | <0.5s              | Performance API         |
| E2E Test Coverage      | 0%             | 3 critical flows   | Playwright Report       |
| Storybook Docs         | 0              | 5+ core components | Storybook UI            |

---

## Notes

- All tasks assume a dedicated developer with React + Vite experience
- Tasks can be parallelized (e.g., Storybook setup can run alongside Week 2)
- Week 1 quick wins should be completed immediately
- After Week 1, consider adding TypeScript incrementally
- Use `bun` package manager as currently configured

---

**Last Updated:** 2026-05-31  
**Version:** 1.0
