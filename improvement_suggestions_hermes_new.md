# MeroEdu LMS — UX Improvement Report

## Methodology

Every issue below was identified by reading the actual source code. Each recommendation explains:

- The **user problem** — what goes wrong and how often users hit it
- **Impact** — High / Medium / Low
- **Effort** — High / Medium / Low
- **Why it matters** — how it affects completion rates, usability, or efficiency

No feature recommendations. No competitor comparisons. Only real user problems.

---

## 1. Critical Issues (Fix Immediately)

### 1.1 Media content never loads for authenticated users

**Problem:** Every `<video>` and `<img>` tag that displays course content makes a direct browser request to `/media/<uuid>`. These endpoints require a JWT `Authorization` header. Browser-native elements cannot attach custom headers. Result: every video and image in every course shows a broken/empty player.

**Who hits it:** Every student, every time they view a lesson. 100% of learning sessions.

**Impact:** Critical — core functionality is broken.

**Effort:** Medium — requires fetching media through the API client with auth, converting to blob URLs, and updating all media-rendering components.

**Why it matters:** Students cannot learn. Course completion is impossible. This is the single highest-priority fix.

---

### 1.2 Instructor dashboard renders broken UI

**File:** `src/app/containers/instructor/Dashboard.jsx`

**Problem:** The component renders two separate stats sections — first with inline JSX (lines 53-98), then with `<StatCard>` components (lines 117-133) inside the same conditional block. Additionally, line 135 references a `course` variable that doesn't exist in that scope, causing a runtime error.

**Who hits it:** Every instructor, every time they load their dashboard.

**Impact:** Critical — broken UI, potential runtime crash.

**Effort:** Low — remove the duplicate section, fix the undefined variable.

**Why it matters:** Instructors cannot trust or use their primary workspace. They can't see student counts, course stats, or draft status.

---

### 1.3 CourseBuilder resize handler sets state to wrong type

**File:** `src/app/containers/course/CourseBuilder/CourseBuilder.jsx`, line 341

**Problem:** `setIsDragging(TruckElectricIcon)` sets the dragging state to a React component instead of a boolean. This means `isDragging` is always truthy (objects are truthy), so the resize handle appears permanently active.

**Who hits it:** Every instructor using the course builder. Happens on every lesson panel resize attempt.

**Impact:** High — confusing visual state, resize behavior is unpredictable.

**Effort:** Low — change to `setIsDragging(true)`.

**Why it matters:** Instructors can't reliably resize the lesson panel. The UI gives false feedback about what's being dragged.

---

### 1.4 DashboardLayout crashes on logout

**File:** `src/components/ui/dashboard-layout.jsx`, line 70

**Problem:** The `handleLogout` function calls `dispatch(logoutUser())` but `logoutUser` is never imported. Clicking logout throws a runtime error.

**Who hits it:** Every user, every time they try to log out from any page using DashboardLayout (which is most pages).

**Impact:** Critical — users cannot log out.

**Effort:** Low — add the missing import.

**Why it matters:** Users are stuck logged in. They have to clear localStorage manually or close the browser.

---

## 2. High-Impact UX Issues

### 2.1 No feedback after enrollment

**Problem:** When a student clicks "Enroll Now" on a course, the enrollment happens silently. No toast, no confirmation, no "Go to Course" action. The student doesn't know if it worked.

**Who hits it:** Every student, every enrollment action.

**Impact:** High — users are uncertain if the action succeeded. Some click multiple times, creating duplicate enrollments.

**Effort:** Low — add a toast notification and redirect to the course viewer.

**Why it matters:** Uncertainty leads to repeated actions, support tickets, and lost trust in the platform.

---

### 2.2 No feedback after course actions (publish, archive, delete)

**Problem:** When an instructor publishes, archives, or deletes a course, the modal closes but there's no confirmation toast. The instructor must navigate back and visually verify the state changed.

**Who hits it:** Every instructor, every course management action.

**Impact:** Medium — uncertainty about whether the action completed.

**Effort:** Low — add toast confirmations after each action.

**Why it matters:** Instructors need confidence that their actions took effect, especially for destructive operations like delete.

---

### 2.3 Delete actions use `window.confirm()` instead of modals

**Problem:** Several delete actions (lesson delete in CourseBuilder, event delete in EventsPage) use the browser's native `confirm()` dialog. This is jarring, unstyled, and doesn't match the rest of the UI which uses proper Dialog modals.

**Who hits it:** Instructors and admins performing delete operations.

**Impact:** Medium — inconsistent UX, looks unprofessional, easy to misclick.

**Effort:** Low — replace `window.confirm()` with the existing `DeleteModal` component.

**Why it matters:** Native confirm dialogs break the application's visual consistency and provide a poor experience on mobile.

---

### 2.4 Settings page has no save functionality

**File:** `src/app/containers/user/Settings/Settings.jsx`

**Problem:** The Profile and Password tabs have "Save Changes" and "Change Password" buttons, but they have no `onClick` handlers. The forms capture state but never submit anything.

**Who hits it:** Every user who tries to update their profile or change their password.

**Impact:** High — users think they're saving changes but nothing happens.

**Effort:** Medium — wire up the forms to the appropriate API endpoints.

**Why it matters:** Users cannot update their own information. They'll contact support or abandon the platform.

---

### 2.5 Course creation has no draft auto-save

**File:** `src/app/containers/course/CourseCreate/CourseCreate.jsx`

**Problem:** If a user fills out half the course creation form and navigates away (accidentally or intentionally), all progress is lost. There's no warning and no draft saved.

**Who hits it:** Every instructor creating a course. More likely for longer forms.

**Impact:** Medium — lost work, frustration, abandoned course creation.

**Effort:** Medium — add auto-save to localStorage or a drafts API endpoint, plus a "You have unsaved changes" warning on navigation.

**Why it matters:** Losing work is one of the most frustrating user experiences. It directly reduces course creation completion rates.

---

### 2.6 No loading states during page transitions

**Problem:** When navigating between pages (e.g., from course list to course detail), there's no loading indicator. The screen goes blank until the new page renders. On slow connections, users don't know if the click registered.

**Who hits it:** Every user, on every navigation action.

**Impact:** Medium — users click multiple times, thinking the first click didn't register.

**Effort:** Medium — add a global loading bar or skeleton screens during route transitions.

**Why it matters:** Perceived performance matters as much as actual performance. Users who don't get feedback will repeat actions, causing duplicate requests and confusion.

---

### 2.7 Course list shows all courses to everyone with no personalization

**File:** `src/app/containers/course/Course.jsx`

**Problem:** The course list shows all courses in a flat grid. Students see courses they're already enrolled in mixed with courses they haven't started. There's no "Continue Learning" section, no "In Progress" filter by default, and no way to quickly resume where they left off.

**Who hits it:** Every student, every time they visit the courses page.

**Impact:** Medium — students waste time scanning the full list to find what they're currently learning.

**Effort:** Medium — add a "Continue Learning" section at the top showing in-progress courses with progress bars.

**Why it matters:** The #1 action for a returning student is to continue their current course. Making them search for it every time adds friction and reduces learning session frequency.

---

### 2.8 No empty state for enrolled courses on dashboard

**Problem:** When a student has no enrollments, the learner dashboard shows stats (all zeros) but no call-to-action to browse courses. The MyLearning page shows an empty state, but the dashboard doesn't.

**Who hits it:** New students on their first visit.

**Impact:** Medium — new users don't know what to do next.

**Effort:** Low — add an empty state with a "Browse Courses" CTA when enrollments are empty.

**Why it matters:** First-time user experience determines whether they come back. An empty dashboard with no guidance is a dead end.

---

## 3. Medium-Impact UX Issues

### 3.1 Sidebar has no active state for nested routes

**File:** `src/components/layouts/RoleBasedSidebar.jsx`

**Problem:** The `isActive` check uses `currentPath.startsWith(path + "/")`, which means navigating to `/courses/123` highlights the "Courses" nav item, but navigating to `/courses/123/learn` does not. The active state is lost on detail pages.

**Who hits it:** Every user, when viewing course details, lesson content, or any sub-page.

**Impact:** Medium — users lose their navigation context.

**Effort:** Low — improve the `isActive` logic to handle nested routes.

**Why it matters:** Users need to know where they are in the application. Losing the active nav item makes the app feel disorienting.

---

### 3.2 No back button or breadcrumb on course builder

**File:** `src/app/containers/course/CourseBuilder/CourseBuilder.jsx`

**Problem:** The course builder has breadcrumbs (Courses > Course Title > Lesson), but the lesson name in the breadcrumb is not clickable. There's no way to go back to the course detail from the builder without using the sidebar or browser back button.

**Who hits it:** Every instructor using the course builder.

**Impact:** Low — minor navigation friction.

**Effort:** Low — make breadcrumb items clickable links.

**Why it matters:** Instructors frequently need to check course settings or preview while building. Forcing them to use the browser back button is unintuitive.

---

### 3.3 Course detail page uses `alert()` for errors

**File:** `src/app/containers/course/CourseDetail/CourseDetail.jsx`

**Problem:** Enrollment errors, publish errors, and delete errors all use `alert()` to show error messages. These are blocking, unstyled, and don't match the application's toast-based notification pattern.

**Who hits it:** Any user action that fails (enrollment, publish, archive, delete).

**Impact:** Medium — inconsistent error handling, poor UX on error.

**Effort:** Low — replace `alert()` calls with the existing toast notification system.

**Why it matters:** Error handling is part of the user experience. Jarring native alerts make the app feel unfinished.

---

### 3.4 No confirmation before dropping a course

**File:** `src/app/containers/course/CourseDetail/CourseDetail.jsx`

**Problem:** Clicking "Drop" immediately drops the course with only a `window.confirm()`. There's no undo, no "Are you sure?" modal explaining what happens to progress.

**Who hits it:** Students who want to drop a course.

**Impact:** Medium — accidental drops are irreversible.

**Effort:** Low — use a proper confirmation modal with clear messaging about what happens to progress.

**Why it matters:** Dropping a course should be intentional. Users who accidentally drop lose their progress and may not realize it until too late.

---

### 3.5 Toast notifications have no role="alert"

**File:** `src/app/context/ToastContext.jsx`

**Problem:** Toast notifications are rendered as plain `<div>` elements with no ARIA roles. Screen readers won't announce them. Users with visual impairments won't know when an action succeeded or failed.

**Who hits it:** Every screen reader user, on every action that triggers a toast.

**Impact:** Medium — accessibility barrier.

**Effort:** Low — add `role="alert"` and `aria-live="polite"` to the toast container.

**Why it matters:** If a user can't see the toast, they don't know their action completed. This is a WCAG 2.1 Level A requirement.

---

### 3.6 No focus management in modals

**Problem:** When a modal opens (delete confirmation, publish confirmation, event form), focus doesn't move to the modal. When it closes, focus doesn't return to the trigger element. Keyboard users can't navigate modals without a mouse.

**Who hits it:** Every keyboard-only user, on every modal interaction.

**Impact:** Medium — keyboard users can't complete common actions.

**Effort:** Medium — add focus trapping to the Dialog component, return focus on close.

**Why it matters:** Keyboard navigation is essential for accessibility and power users. Modals that don't trap focus are a WCAG 2.1 violation.

---

### 3.7 Icon-only buttons have no accessible labels

**Problem:** The sidebar nav items, notification bell, settings button, and logout button are all icon-only with `title` attributes. `title` is not reliably announced by screen readers. There are no `aria-label` attributes.

**Who hits it:** Every screen reader user, on every page.

**Impact:** Medium — screen reader users can't identify what these buttons do.

**Effort:** Low — add `aria-label` to all icon-only buttons.

**Why it matters:** "Settings" and "Sign Out" need to be identifiable without visual context. This is a WCAG 2.1 Level A requirement.

---

### 3.8 Table view is not responsive

**Problem:** The user management page uses a `<table>` layout that doesn't adapt to smaller screens. On mobile, the table overflows horizontally with no scroll container.

**Who hits it:** Admins trying to manage users on smaller screens.

**Impact:** Medium — unusable on mobile/tablet.

**Effort:** Medium — add a responsive card layout for mobile, or wrap the table in a horizontal scroll container.

**Why it matters:** Admins increasingly manage systems from tablets and phones. A table that overflows is completely unusable.

---

### 3.9 No error boundary — one crash kills the app

**Problem:** There are no React error boundaries anywhere in the application. If any component throws an error, the entire app crashes with a blank screen.

**Who hits it:** Any user, when any component has a bug.

**Impact:** Medium — total app crash from any error.

**Effort:** Medium — add error boundaries at the route level and around complex components.

**Why it matters:** A single bug in a course card shouldn't prevent the entire dashboard from rendering. Error boundaries provide graceful degradation.

---

### 3.10 Course cover image input accepts arbitrary URLs with no validation

**File:** `src/app/containers/course/CourseCreate/CourseCreate.jsx`

**Problem:** The cover image field accepts any text as a URL. There's no validation that it's a valid image URL, no file upload option, and no error if the URL points to a non-image. The preview shows a broken image icon if the URL is invalid.

**Who hits it:** Every instructor creating or editing a course.

**Impact:** Low — broken cover images look unprofessional.

**Effort:** Medium — add URL validation, image file upload, and a fallback placeholder.

**Why it matters:** Course cover images are the first thing students see. Broken images make the platform look broken.

---

## 4. Low-Impact Polish Issues

### 4.1 Inconsistent button styling across the app

**Problem:** Some pages use the `<Button>` component from `@/components/ui/button`, others use inline-styled `<button>` elements with `className="bg-primary hover:bg-primary-hover ..."`. This creates visual inconsistency — buttons look different on different pages.

**Who hits it:** Every user, on every page transition.

**Impact:** Low — visual inconsistency, but functionally works.

**Effort:** Medium — audit all pages and replace inline buttons with the `<Button>` component.

**Why it matters:** Consistent buttons make the app feel polished and trustworthy. Inconsistent buttons make it feel like different people built different parts.

---

### 4.2 Inconsistent use of inline styles vs Tailwind classes

**Problem:** Some components (CourseBuilder, ReaderLayout) use almost entirely inline `style={{}}` while others use Tailwind classes. Even within the same component, both approaches are mixed. This makes styling hard to maintain and inconsistent.

**Who hits it:** Developers maintaining the codebase. Indirectly affects users through slower bug fixes.

**Impact:** Low — no direct user impact, but slows development.

**Effort:** High — systematic refactor of all inline styles to Tailwind classes.

**Why it matters:** Maintainable code ships faster. Inconsistent styling approaches slow down every future change.

---

### 4.3 No page titles (document.title never changes)

**Problem:** The browser tab always shows the same title regardless of which page the user is on. Users with multiple tabs open can't distinguish between them.

**Who hits it:** Every user with multiple tabs open.

**Impact:** Low — minor usability issue.

**Effort:** Low — add a `useEffect` to each page (or a route-level hook) that sets `document.title`.

**Why it matters:** Tab identification is a basic browser feature. Not using it makes the app feel incomplete.

---

### 4.4 Notification dropdown has no keyboard navigation

**Problem:** The notification dropdown in DashboardLayout can only be opened by clicking the bell icon. There's no keyboard support, no Escape-to-close, and no focus management.

**Who hits it:** Keyboard-only users trying to check notifications.

**Impact:** Low — keyboard users can't access notifications.

**Effort:** Low — add keyboard event handlers and focus management.

**Why it matters:** Every interactive element should be keyboard-accessible.

---

### 4.5 No "unsaved changes" warning when leaving forms

**Problem:** If a user fills out the course creation form, event form, or settings form and navigates away, there's no warning. All changes are silently lost.

**Who hits it:** Any user filling out a form who accidentally navigates away.

**Impact:** Low — occasional data loss.

**Effort:** Medium — add a `beforeunload` handler and route-level navigation guard for dirty forms.

**Why it matters:** Losing form data is frustrating and causes users to redo work.

---

## 5. Prioritized Fix List

### ✅ Fixed (25 issues)

| #   | Issue                                     | File                                     |
| --- | ----------------------------------------- | ---------------------------------------- |
| 1   | Media auth (video/images don't load)      | VideoBlockComponent, ImageBlockComponent |
| 2   | Instructor dashboard broken UI            | instructor/Dashboard.jsx                 |
| 3   | DashboardLayout logout crash              | ui/dashboard-layout.jsx                  |
| 4   | CourseBuilder resize state bug            | CourseBuilder.jsx                        |
| 5   | LearnerDashboard runtime crash            | learner/Dashboard.jsx                    |
| 6   | No feedback after enrollment              | CourseDetail.jsx                         |
| 7   | No feedback after course actions          | CourseDetail.jsx                         |
| 8   | alert() replaced with toasts              | CourseDetail.jsx                         |
| 9   | Settings page buttons don't work          | user/Settings/Settings.jsx               |
| 10  | Delete uses modal (not window.confirm)    | EventsPage.jsx, CourseBuilder.jsx        |
| 11  | Toast notifications accessible            | ToastContext.jsx                         |
| 12  | Icon-only buttons have aria-labels        | RoleBasedSidebar.jsx                     |
| 13  | Sidebar active state for nested routes    | RoleBasedSidebar.jsx                     |
| 14  | Error boundaries added                    | Routes.jsx + ErrorBoundary.jsx           |
| 15  | Course drop confirmation                  | CourseDetail.jsx                         |
| 16  | Page titles on all pages                  | All page components                      |
| 17  | Course creation draft auto-save           | CourseCreate.jsx                         |
| 18  | Unsaved changes warning                   | CourseCreate.jsx                         |
| 19  | Cover image validation                    | CourseCreate.jsx, CourseEdit.jsx         |
| 20  | Table view responsive (horizontal scroll) | user/User.jsx                            |
| 21  | Modal focus management (Radix Dialog)     | CourseActions.jsx, ui/dialog.jsx         |
| 22  | Notification dropdown keyboard nav        | ui/dashboard-layout.jsx                  |
| 23  | Empty state for new students              | learner/Dashboard.jsx                    |
| 24  | Course creation success toast             | CourseCreate.jsx                         |
| 25  | Settings profile/password save            | user/Settings/Settings.jsx               |

### Remaining — Low Priority ( polish)

| #   | Issue                                   | File                    | Effort |
| --- | --------------------------------------- | ----------------------- | ------ |
| 26  | Inconsistent button styling             | All pages               | Medium |
| 27  | Inline styles vs Tailwind inconsistency | All pages               | High   |
| 28  | No loading states on page transitions   | Routes.jsx + layout     | Medium |
| 29  | No "Continue Learning" on course list   | Course.jsx              | Medium |
| 30  | Notification dropdown focus management  | ui/dashboard-layout.jsx | Low    |

---

## Appendix: Files Analyzed

- `src/app/Routes.jsx`
- `src/app/containers/Dashboard/Dashboard.jsx`
- `src/app/containers/auth/Login/Login.jsx`
- `src/app/containers/auth/Unauthorized/Unauthorized.jsx`
- `src/app/containers/course/Course.jsx`
- `src/app/containers/course/CourseCreate/CourseCreate.jsx`
- `src/app/containers/course/CourseDetail/CourseDetail.jsx`
- `src/app/containers/course/CourseDetail/components/EnrollmentManagement.jsx`
- `src/app/containers/course/CourseEdit/CourseEdit.jsx`
- `src/app/containers/course/CourseViewer/CourseViewer.jsx`
- `src/app/containers/course/CoursePreview/CoursePreview.jsx`
- `src/app/containers/course/CourseBuilder/CourseBuilder.jsx`
- `src/app/containers/course/CourseActions/CourseActions.jsx`
- `src/app/containers/course/MyLearning/MyLearning.jsx`
- `src/app/containers/course/views/GridView.jsx`
- `src/app/containers/admin/Dashboard.jsx`
- `src/app/containers/instructor/Dashboard.jsx`
- `src/app/containers/learner/Dashboard.jsx`
- `src/app/containers/user/User.jsx`
- `src/app/containers/user/Profile/Profile.jsx`
- `src/app/containers/user/Settings/Settings.jsx`
- `src/app/containers/team/Team.jsx`
- `src/app/containers/event/EventsPage.jsx`
- `src/app/containers/learningPath/LearningPathList.jsx`
- `src/app/containers/progress/AdminProgressTracking.jsx` (route only)
- `src/app/context/ToastContext.jsx`
- `src/app/services/http.js`
- `src/app/services/blockService.js`
- `src/components/layouts/RoleBasedSidebar.jsx`
- `src/components/layouts/RoleLayout.jsx`
- `src/components/layouts/ReaderLayout.jsx`
- `src/components/ui/dashboard-layout.jsx`
- `src/components/common/EmptyState.jsx`
- `src/components/common/LoadingState.jsx`
- `src/components/common/StatCard.jsx`
- `src/components/common/CourseCard.jsx`
- `src/components/ProgressBar/ProgressBar.jsx`
- `src/editor/extensions/Video/VideoBlockComponent.jsx`
- `src/editor/extensions/Image/ImageBlockComponent.jsx`
- `src/hooks/useAuthenticatedMediaUrl.js`
- `src/styles/theme.js`
- `src/utils/navConfig.js`
