# MeroEdu LMS — UX Audit Report & Improvement Plan

## 1. Executive Summary

| Dimension             | Score (1-10) | Notes                                                                                                          |
| --------------------- | :----------: | -------------------------------------------------------------------------------------------------------------- |
| Overall UI            |      5       | Functional but inconsistent; mixes inline styles with Tailwind classes; visual hierarchy needs work            |
| Overall UX            |      4       | Core flows work but have friction; missing key LMS patterns (continue learning, recommendations, certificates) |
| Accessibility         |      3       | No ARIA labels, no skip links, poor focus management, no keyboard navigation support for sidebar               |
| Mobile Responsiveness |      2       | Sidebar is fixed-width with no mobile collapse; most pages use inline styles that don't adapt; no mobile nav   |

### Biggest Strengths

- Role-based architecture is well-structured (Admin/Instructor/Student/Team Lead)
- Course builder with autosave and block-based content is solid
- ReaderLayout provides a good full-viewport reading experience
- Theme system with dark/light mode support
- Good use of shared components (EmptyState, LoadingState, StatCard, ConfirmDialog)

### Biggest Weaknesses

- **No mobile support whatsoever** — sidebar is fixed, no hamburger menu, no responsive breakpoints
- **Inconsistent styling approach** — mixes Tailwind CSS classes with inline `style={{}}` throughout, making maintenance hard
- **Missing critical LMS features** — no course recommendations, no certificates, no learning streaks, no course ratings/reviews
- **Poor accessibility** — no ARIA attributes, no keyboard navigation, no screen reader support
- **Auth media issue** — `<video>` and `<img>` tags make unauthenticated requests to protected media endpoints
- **No loading states on navigation** — page transitions feel abrupt with no skeleton/loading indicators
- **Instructor dashboard is broken** — renders duplicate stats sections and references undefined `course` variable

### Highest-Impact Improvements

1. Mobile responsiveness (huge user base impact)
2. Fix auth media loading (blocks core functionality)
3. Unify styling approach (Tailwind only, remove inline styles)
4. Add missing LMS features (certificates, recommendations, ratings)
5. Accessibility audit and fixes

---

## 2. Student Experience Review

### 2.1 Enrollment Experience

**Course Discovery** (`/courses` — CourseContainer)

- **Severity: High** — Course list shows ALL courses to everyone with no personalization
- **Current:** Single flat list with status/category/sort filters. No "recommended for you" or "continue learning" section.
- **Recommendation:** Add a "Continue Learning" section at the top showing in-progress courses. Add course recommendations based on enrolled categories.

**Search & Filters**

- **Severity: Medium** — Search works but has no autocomplete, no recent searches, no search suggestions
- **Current:** Basic text search with status/category/sort dropdowns
- **Recommendation:** Add search autocomplete, recent searches, and popular searches. Add advanced filters (duration, difficulty level, rating).

**Enrollment Process**

- **Severity: Medium** — Enrollment is a single click but with no confirmation or success feedback
- **Current:** Click "Enroll Now" → immediate enrollment with no toast/confirmation
- **Recommendation:** Add enrollment confirmation modal, success toast with "Go to Course" action, and welcome email trigger.

### 2.2 Learning Experience

**Course Viewer** (`/courses/:id/learn` — CourseViewer)

- **Severity: Critical** — Video and image content doesn't load because `<video>`/`<img>` tags can't send auth headers
- **Current:** Media blocks use raw URLs that require authentication but browser elements can't attach Authorization headers
- **Recommendation:** Already being fixed — use authenticated blob URLs via `useAuthenticatedMediaUrl` hook

**Lesson Navigation**

- **Severity: Medium** — Sidebar lesson list is functional but basic
- **Current:** Simple numbered list with completion checkmarks. No progress percentage per lesson, no estimated time.
- **Recommendation:** Add lesson duration estimates, progress indicators per lesson, and lock/unlock indicators for sequential learning.

**Video Player**

- **Severity: High** — No custom video player; relies on native browser controls
- **Current:** Native `<video>` element with default controls. No playback speed, no quality selector, no fullscreen button overlay.
- **Recommendation:** Build or integrate a custom video player (e.g., Video.js, Plyr) with playback speed, quality controls, and progress tracking.

**Reading Experience**

- **Severity: Low** — ReaderLayout is clean but could be better
- **Current:** Full-viewport reading with sidebar lesson list and top breadcrumb bar
- **Recommendation:** Add reading progress indicator, font size controls, bookmarking, and note-taking capability.

### 2.3 Progress Tracking

**Progress Visibility**

- **Severity: Medium** — Progress is shown but not prominently
- **Current:** Progress bar in sidebar, percentage in My Learning page. No visual celebration on completion.
- **Recommendation:** Add course completion certificates, achievement badges, progress streaks, and celebration animations.

**My Learning Page**

- **Severity: Medium** — Functional but lacks engagement features
- **Current:** Shows enrolled courses with progress bars, status filters, and sort options
- **Recommendation:** Add "Continue where you left off" section, learning streaks, weekly goals, and certificate downloads.

---

## 3. Instructor Experience Review

### 3.1 Course Creation Workflow

**Course Create** (`/courses/create` — CourseCreate)

- **Severity: Medium** — Form is functional but has no draft auto-save
- **Current:** Standard form submission. If you navigate away, progress is lost.
- **Recommendation:** Add auto-save drafts, progress indicator (step 1 of 3), and "Save as Draft" button.

**Course Builder** (`/courses/:id/builder` — CourseBuilder)

- **Severity: High** — Instructor dashboard has broken code (duplicate stats, undefined `course` variable)
- **Current:** The InstructorDashboard component renders two separate stats sections and references `course` which is undefined in scope
- **Recommendation:** Fix the duplicate rendering bug. The component has both inline stat cards AND StatCard components rendered conditionally.

**Lesson Management**

- **Severity: Medium** — Lesson panel is functional but basic
- **Current:** Add/rename/delete lessons with drag-and-drop reorder. No lesson duplication, no lesson templates.
- **Recommendation:** Add lesson duplication, lesson templates (video lesson, reading, quiz), and bulk lesson operations.

### 3.2 Content Management

**Block Editor**

- **Severity: Low** — MeroEduEditor with TipTap is functional
- **Current:** Block-based editor with autosave. Supports text, video, image blocks.
- **Recommendation:** Add more block types (quiz, code, embed, file attachment), slash commands, and AI content generation.

**Media Management**

- **Severity: Medium** — No centralized media library
- **Current:** Media is uploaded per-block with no library view. No reuse of previously uploaded files.
- **Recommendation:** Add a media library modal showing all uploaded files with search, filter, and reuse capability.

---

## 4. Administrator Experience Review

### 4.1 Dashboard

**Admin Dashboard** (`/admin/dashboard`)

- **Severity: Medium** — Shows basic stats but lacks depth
- **Current:** 4 stat cards (courses, users, teams, categories) + quick actions. No charts, no trends, no recent activity.
- **Recommendation:** Add enrollment trends chart, recent activity feed, top courses by enrollment, and user growth metrics.

**User Management** (`/admin/users`)

- **Severity: Medium** — Basic CRUD with no bulk operations
- **Current:** User list with create/edit/delete. No bulk import, no user activity view, no role assignment UI.
- **Recommendation:** Add bulk user import (CSV), user activity timeline, role assignment modal, and user deactivation.

### 4.2 Reporting

**Progress Tracking** (`/admin/progress`)

- **Severity: High** — No reporting or analytics interface
- **Current:** Route exists but no meaningful reporting UI
- **Recommendation:** Add course completion reports, learner progress reports, instructor performance metrics, and export to CSV/PDF.

---

## 5. Navigation & Information Architecture

### 5.1 Sidebar

**RoleBasedSidebar**

- **Severity: Critical** — No mobile support; sidebar is always visible and takes up 70px
- **Current:** Icon-only sidebar with hover tooltips. Fixed width, no collapse, no mobile hamburger menu.
- **Recommendation:** Add mobile hamburger menu, collapsible sidebar for desktop, and proper responsive breakpoints.

**Navigation Items**

- **Severity: Medium** — Instructor nav has duplicate "My Courses" and "My Learning" entries
- **Current:** Instructor nav shows both "My Courses" (→ /courses) and "My Learning" (→ /my-learning) which may confuse users
- **Recommendation:** Clarify the distinction or merge. Consider "My Courses" for teaching and "Enrolled Courses" for learning.

### 5.2 Breadcrumbs

**Severity: Low** — Breadcrumbs are present but inconsistent

- **Current:** Some pages have breadcrumbs (CourseDetail, CourseViewer, CourseBuilder) but others don't
- **Recommendation:** Add consistent breadcrumbs to all pages using a shared Breadcrumb component

---

## 6. Design Consistency Review

### 6.1 Styling Approach

**Severity: Critical** — Inconsistent styling approach throughout

- **Current:** Mixes Tailwind CSS classes (`className="flex items-center gap-2"`) with inline styles (`style={{ display: "flex", gap: 8 }}`) even within the same component
- **Examples:**
  - `CourseBuilder.jsx` — Almost entirely inline styles (500+ lines of `style={{}}`)
  - `CourseViewer.jsx` — Mixes Tailwind and inline styles
  - `DashboardLayout.jsx` — Uses Tailwind for layout but inline for dynamic values
  - `ReaderLayout.jsx` — Almost entirely inline styles
- **Recommendation:** Standardize on Tailwind CSS classes. Use arbitrary values for dynamic values (e.g., `style={{ width: `${percent}%` }}` → keep as inline only for truly dynamic values). Create a Tailwind config with design tokens.

### 6.2 Button System

**Severity: High** — Inconsistent button styling

- **Current:** Multiple button patterns:
  - `<Button>` component from `@/components/ui/button` (shadcn-style)
  - Inline styled buttons with `className="bg-primary hover:bg-primary-hover ..."`
  - Permission-guarded buttons with different styling
- **Recommendation:** Use the `<Button>` component consistently. Define variants in the Button component (primary, secondary, ghost, danger). Never use inline button styles.

### 6.3 Color System

**Severity: Medium** — Colors are defined as CSS custom properties but used inconsistently

- **Current:** Theme uses CSS custom properties (`--primary`, `--success`, `--error`) but some components use hardcoded colors (`#22C55E`, `#6366F1`)
- **Recommendation:** Always use theme tokens via the `t()` helper or Tailwind classes. Never hardcode color values.

### 6.4 Typography

**Severity: Medium** — No consistent typography scale

- **Current:** Font sizes are inconsistent: `text-xs` (12px), `text-[11px]`, `text-sm` (14px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px). Some use `fontSize: 13` inline.
- **Recommendation:** Define a typography scale in Tailwind config. Use consistent sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px), 3xl (30px).

### 6.5 Spacing

**Severity: Medium** — Inconsistent spacing

- **Current:** Mixes Tailwind spacing (`gap-2`, `gap-4`, `p-4`) with inline spacing (`padding: "0 16px"`, `gap: 12`)
- **Recommendation:** Use Tailwind spacing consistently. Define a spacing scale if needed.

---

## 7. Accessibility Review

### 7.1 Keyboard Navigation

**Severity: Critical** — No keyboard navigation support

- **Current:** Sidebar items are `<Link>` elements but have no focus indicators. No skip-to-content link. Modal dialogs don't trap focus.
- **Recommendation:** Add visible focus rings to all interactive elements. Add skip-to-content link. Implement focus trapping in modals.

### 7.2 Screen Reader Support

**Severity: Critical** — No ARIA attributes or semantic HTML

- **Current:** No `aria-label`, `aria-describedby`, `role`, or other ARIA attributes. Images have empty `alt=""`. No landmark roles.
- **Recommendation:** Add ARIA labels to icon-only buttons (sidebar nav items, notification bell). Add `alt` text to images. Use semantic HTML (`<nav>`, `<main>`, `<aside>`, `<header>`).

### 7.3 Color Contrast

**Severity: High** — Some text colors may not meet WCAG AA

- **Current:** Uses `text-text-muted` for secondary text which may have insufficient contrast, especially in dark mode
- **Recommendation:** Audit all color combinations for WCAG AA compliance (4.5:1 for normal text, 3:1 for large text). Use a contrast checker tool.

### 7.4 Form Accessibility

**Severity: Medium** — Form labels are present but could be better

- **Current:** Labels are associated with inputs but error messages aren't linked via `aria-describedby`
- **Recommendation:** Add `aria-describedby` linking inputs to error messages. Add `aria-invalid` to invalid fields. Add `aria-required` to required fields.

---

## 8. Mobile & Responsive Experience

### 8.1 Layout

**Severity: Critical** — No mobile responsiveness

- **Current:** Sidebar is fixed at ~70px width with no collapse. Content area doesn't adapt to screen size. No mobile navigation.
- **Recommendation:**
  - Add hamburger menu for mobile
  - Make sidebar collapsible/overlay on mobile
  - Use responsive breakpoints for all grid layouts
  - Add touch-friendly tap targets (min 44x44px)

### 8.2 Course Grid

**Severity: High** — Grid doesn't adapt to screen size

- **Current:** `GridView` uses `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` which is good, but other views don't
- **Recommendation:** Ensure all views (table, list, compact) have responsive variants. Table view should cardify on mobile.

### 8.3 Touch Usability

**Severity: High** — Touch targets are too small

- **Current:** Sidebar icons are 18px with minimal padding. Buttons are `h-8` (32px) which is below the 44px minimum.
- **Recommendation:** Increase touch targets to minimum 44x44px. Add more padding to interactive elements.

---

## 9. LMS-Specific UX Improvements

### 9.1 Missing Features

**Course Recommendations**

- **Severity: High** — No personalized recommendations
- **Recommendation:** Add "Recommended for You" section based on enrolled categories, popular courses, and trending content.

**Certificates**

- **Severity: High** — No certificate generation
- **Recommendation:** Generate PDF certificates on course completion with student name, course name, completion date, and unique certificate ID.

**Learning Streaks**

- **Severity: Medium** — No engagement gamification
- **Recommendation:** Add daily learning streak counter, weekly goals, and achievement badges.

**Course Ratings & Reviews**

- **Severity: High** — No rating system
- **Recommendation:** Add 5-star rating system with written reviews. Show average rating on course cards.

**Recently Viewed**

- **Severity: Low** — No recently viewed tracking
- **Recommendation:** Track and display recently viewed courses on the dashboard.

**Personalized Dashboard**

- **Severity: Medium** — Dashboards are role-based but not personalized
- **Recommendation:** Add customizable dashboard widgets, drag-and-drop layout, and personal quick links.

---

## 10. User Friction Analysis

### 10.1 Critical Friction Points

| Issue                                         | Severity | Impact                                      |
| --------------------------------------------- | :------: | ------------------------------------------- |
| Media (video/images) don't load due to auth   | Critical | Students can't view course content          |
| No mobile support                             | Critical | 60%+ of users on mobile can't use the app   |
| Instructor dashboard broken (duplicate stats) | Critical | Instructors see broken UI                   |
| No keyboard navigation                        |   High   | Users with motor impairments can't navigate |
| No screen reader support                      |   High   | Blind users can't use the app               |

### 10.2 High Friction Points

| Issue                       | Severity | Impact                                   |
| --------------------------- | :------: | ---------------------------------------- |
| Inconsistent button styling |   High   | Users can't predict interactive elements |
| No course recommendations   |   High   | Students don't discover relevant content |
| No certificates             |   High   | Students have no proof of completion     |
| No video player controls    |   High   | Poor learning experience                 |
| No bulk user operations     |   High   | Admins waste time on repetitive tasks    |

### 10.3 Medium Friction Points

| Issue                      | Severity | Impact                                    |
| -------------------------- | :------: | ----------------------------------------- |
| No search autocomplete     |  Medium  | Slower course discovery                   |
| No lesson duplication      |  Medium  | Instructors waste time recreating content |
| No media library           |  Medium  | Can't reuse uploaded files                |
| No breadcrumb consistency  |  Medium  | Users get lost in navigation              |
| No enrollment confirmation |  Medium  | Users unsure if action succeeded          |

---

## 11. Visual Design Review

### 11.1 Modern Appearance

**Severity: Medium** — Functional but dated

- **Current:** Clean but basic design. Uses neutral colors with primary accent. No visual hierarchy through shadows, gradients, or animations.
- **Recommendation:** Add subtle shadows, rounded corners, and micro-interactions. Use gradient accents for CTAs. Add hover animations on cards.

### 11.2 Professional Appearance

**Severity: Medium** — Looks like an internal tool, not a polished product

- **Current:** Minimal branding, no illustrations, no onboarding. Login page is clean but generic.
- **Recommendation:** Add branded illustrations, onboarding tour for new users, and empty state illustrations.

### 11.3 Trustworthiness

**Severity: Low** — No social proof or trust indicators

- **Current:** No testimonials, no student count, no instructor credentials displayed
- **Recommendation:** Add student testimonials, instructor profiles with credentials, and course enrollment counts.

---

## 12. Design System Recommendations

### 12.1 Typography Scale

```
xs: 12px — Captions, timestamps, badges
sm: 14px — Body text, descriptions
base: 16px — Default body (currently underused)
lg: 18px — Section headings
xl: 20px — Page headings
2xl: 24px — Dashboard stats
3xl: 30px — Hero headings
```

### 12.2 Color System

```
Primary:    var(--primary)    — Main actions, links
Success:    var(--success)    — Positive states, completion
Warning:    var(--warning)    — Warnings, drafts
Error:      var(--error)      — Errors, destructive actions
Accent:     var(--accent)     — Secondary emphasis
Muted:      var(--text-muted) — Secondary text
Surface:    var(--bg-surface) — Card backgrounds
```

### 12.3 Button System

```
Variant: primary   — bg-primary text-white
Variant: secondary — bg-secondary text-primary
Variant: ghost     — transparent hover:bg-hover
Variant: danger    — bg-error text-white
Size: sm (h-8), md (h-10), lg (h-12)
```

### 12.4 Spacing Scale

```
1: 4px   — Tight spacing
2: 8px   — Compact spacing
3: 12px  — Default spacing
4: 16px  — Standard spacing
6: 24px  — Section spacing
8: 32px  — Large section spacing
12: 48px — Page-level spacing
```

---

## 13. Benchmark Comparison

### 13.1 vs Coursera

- **Missing:** Course recommendations, certificates, peer reviews, discussion forums, mobile app, video transcripts, subtitles
- **Present:** Course listing, enrollment, progress tracking, role-based access

### 13.2 vs Udemy

- **Missing:** Course ratings/reviews, Q&A section, instructor dashboard with revenue, coupon system, wishlist
- **Present:** Course creation, video content, student enrollment

### 13.3 vs Canvas

- **Missing:** Gradebook, assignment submission, discussion boards, calendar integration, announcements
- **Present:** Course structure, lesson management, enrollment tracking

### 13.4 vs Moodle

- **Missing:** Plugin system, SCORM support, competency frameworks, badges, activity completion
- **Present:** Course categories, role-based access, progress tracking

---

## 14. Prioritized Improvement Roadmap

### Quick Wins (1-2 Days)

| #   | Task                                           | Impact   | Effort |
| --- | ---------------------------------------------- | -------- | ------ |
| 1   | Fix auth media loading (video/image blob URLs) | Critical | Low    |
| 2   | Fix InstructorDashboard duplicate stats bug    | Critical | Low    |
| 3   | Add `alt` text to all images                   | High     | Low    |
| 4   | Add ARIA labels to icon-only buttons           | High     | Low    |
| 5   | Fix hardcoded colors to use theme tokens       | Medium   | Low    |
| 6   | Add focus indicators to interactive elements   | High     | Low    |
| 7   | Add enrollment success toast                   | Medium   | Low    |
| 8   | Add loading state to page transitions          | Medium   | Low    |

### Short-Term Improvements (1-2 Weeks)

| #   | Task                                                       | Impact   | Effort |
| --- | ---------------------------------------------------------- | -------- | ------ |
| 1   | Add mobile hamburger menu and responsive sidebar           | Critical | Medium |
| 2   | Unify button styling (use `<Button>` component everywhere) | High     | Medium |
| 3   | Add course completion certificates (PDF generation)        | High     | Medium |
| 4   | Add course ratings and reviews system                      | High     | Medium |
| 5   | Add "Continue Learning" section to student dashboard       | High     | Low    |
| 6   | Add skip-to-content link and keyboard navigation           | High     | Medium |
| 7   | Add responsive breakpoints to all views                    | High     | Medium |
| 8   | Add lesson duration estimates and progress per lesson      | Medium   | Low    |
| 9   | Add media library for reusing uploaded files               | Medium   | Medium |
| 10  | Add breadcrumb consistency across all pages                | Medium   | Low    |

### Medium-Term Improvements (1-2 Months)

| #   | Task                                             | Impact   | Effort |
| --- | ------------------------------------------------ | -------- | ------ |
| 1   | Full mobile responsiveness overhaul              | Critical | High   |
| 2   | Replace inline styles with Tailwind classes      | High     | High   |
| 3   | Build custom video player with progress tracking | High     | High   |
| 4   | Add course recommendation engine                 | High     | High   |
| 5   | Add learning streaks and gamification            | Medium   | Medium |
| 6   | Add admin reporting and analytics dashboard      | High     | High   |
| 7   | Add bulk user import (CSV)                       | Medium   | Medium |
| 8   | Add lesson duplication and templates             | Medium   | Medium |
| 9   | Add course auto-save drafts                      | Medium   | Medium |
| 10  | Add notification system improvements             | Medium   | Medium |

### Long-Term Product Enhancements

| #   | Task                                | Impact | Effort    |
| --- | ----------------------------------- | ------ | --------- |
| 1   | Discussion forums per course        | High   | High      |
| 2   | Assignment submission and grading   | High   | High      |
| 3   | Calendar integration for events     | Medium | High      |
| 4   | SCORM/xAPI compliance               | Medium | High      |
| 5   | Mobile app (React Native)           | High   | Very High |
| 6   | AI-powered content recommendations  | Medium | High      |
| 7   | Multi-language support (i18n)       | Medium | High      |
| 8   | White-label / multi-tenant support  | Low    | Very High |
| 9   | API rate limiting and analytics     | Medium | Medium    |
| 10  | Webhook integrations (Slack, Teams) | Low    | Medium    |

---

## Appendix A: Files Reviewed

### Pages

- `src/app/Routes.jsx` — Route configuration
- `src/app/containers/Dashboard/Dashboard.jsx` — Role-based dashboard router
- `src/app/containers/auth/Login/Login.jsx` — Login page
- `src/app/containers/course/Course.jsx` — Course listing
- `src/app/containers/course/CourseDetail/CourseDetail.jsx` — Course detail
- `src/app/containers/course/CourseViewer/CourseViewer.jsx` — Course viewer
- `src/app/containers/course/CourseBuilder/CourseBuilder.jsx` — Course builder
- `src/app/containers/course/CoursePreview/CoursePreview.jsx` — Course preview
- `src/app/containers/course/MyLearning/MyLearning.jsx` — My Learning
- `src/app/containers/admin/Dashboard.jsx` — Admin dashboard
- `src/app/containers/instructor/Dashboard.jsx` — Instructor dashboard
- `src/app/containers/learner/Dashboard.jsx` — Learner dashboard

### Components

- `src/components/layouts/RoleBasedSidebar.jsx` — Sidebar navigation
- `src/components/layouts/RoleLayout.jsx` — Role-based layout wrapper
- `src/components/layouts/ReaderLayout.jsx` — Reading layout
- `src/components/common/CourseCard.jsx` — Course card
- `src/components/common/EmptyState.jsx` — Empty state
- `src/components/common/LoadingState.jsx` — Loading state
- `src/components/common/StatCard.jsx` — Statistics card
- `src/components/ui/dashboard-layout.jsx` — Dashboard layout with notifications
- `src/components/ui/button.jsx` — Button component
- `src/editor/extensions/Video/VideoBlockComponent.jsx` — Video block
- `src/editor/extensions/Image/ImageBlockComponent.jsx` — Image block

### Services

- `src/app/services/http.js` — HTTP client
- `src/app/services/blockService.js` — Block/media service
- `src/app/services/courseService.js` — Course service
- `src/app/services/enrollmentService.js` — Enrollment service

### Utilities

- `src/styles/theme.js` — Theme system
- `src/utils/navConfig.js` — Navigation configuration
- `src/hooks/useAuthenticatedMediaUrl.js` — Auth media hook (new)

---

## Appendix B: Critical Bugs Found

### Bug 1: InstructorDashboard Duplicate Stats

**File:** `src/app/containers/instructor/Dashboard.jsx`
**Lines:** 53-98 (inline stat cards) and 117-133 (StatCard components)
**Issue:** The component renders two separate stats sections — first with inline JSX, then with StatCard components inside a conditional block. Also references `course` variable on line 135 which is undefined in that scope.
**Fix:** Remove the duplicate stats section and fix the undefined variable reference.

### Bug 2: Auth Media Not Loading

**File:** `src/editor/extensions/Video/VideoBlockComponent.jsx`, `src/editor/extensions/Image/ImageBlockComponent.jsx`
**Issue:** `<video>` and `<img>` tags make unauthenticated requests to protected `/media/:uuid` endpoints
**Fix:** Use `useAuthenticatedMediaUrl` hook to fetch media with auth headers and convert to blob URLs (in progress)

### Bug 3: CourseBuilder Resize Handler

**File:** `src/app/containers/course/CourseBuilder/CourseBuilder.jsx`
**Line:** 341 — `setIsDragging(TruckElectricIcon)` sets the dragging state to an icon component instead of a boolean
**Fix:** Change to `setIsDragging(true)`

### Bug 4: DashboardLayout Missing Import

**File:** `src/components/ui/dashboard-layout.jsx`
**Line:** 70 — References `dispatch(logoutUser())` but doesn't import `logoutUser`
**Fix:** Add `import { logoutUser } from "@/redux/slices/authSlice";`
