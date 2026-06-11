# Course Management A–Z — Frontend Improvement Plan

Date: 2026-06-11
Scope: frontend (`src/app/containers/course/**`, `category/**`, `courseService.js`), backend changes only where the frontend is blocked without them.

Lifecycle covered: **Discover → Create → Edit → Build → Preview → Publish → Enroll → Learn → Track → Archive/Restore → Delete**.

---

## P0 — Correctness bugs (fix first; features silently broken today)

### P0.1 CourseBuilder never saves lesson content to the lesson record
`CourseBuilder.jsx:274` — the `updateLesson(...)` call is commented out; Save only writes to the autosave endpoint. If autosave data is ever lost/expired, lesson content is gone, and any consumer reading `lesson.content` (instead of autosave) sees stale/empty content.
**Fix:** on explicit Save, persist content via `updateLesson` AND autosave; treat autosave as recovery only. Effort: S.

### P0.2 Course list filters/sort/search are decorative
`Course.jsx` + `courseService.fetchCourses` — search/status/category/sort are in the URL but never sent to the API; only `start`/`limit` go through. Users believe they filtered; they didn't (beyond the current page).
**Fix:** pass `search`, `status`, `category`, `sort` through `fetchCourses` query string (backend already supports fulltext search — migration 18 added fulltext indexes; verify which params `GET /courses` accepts and align). Add 300ms debounced search. Effort: M.

### P0.3 Category filter uses hardcoded mock list
`Course.jsx` uses `mockCategories` (5 hardcoded strings); real categories never appear.
**Fix:** load via `fetchCategories()` (already real API, already used in CourseCreate). Effort: S.

### P0.4 CoursePreview content double-parse / wrong format
`CoursePreview.jsx` reads `snapshot.content` (still a JSON string) and passes raw DB blocks to the editor without converting to document format (`blocksToDoc` lives un-exported in CourseBuilder). Preview can render blank/broken.
**Fix:** extract a shared `parseLessonContent(snapshot|blocks)` util (e.g. `src/editor/utils/content.js`), reuse in CourseBuilder, CoursePreview, CourseViewer (same parse chain is hand-rolled in all three). Effort: M.

### P0.5 CourseEdit category can submit a name string instead of an ID
`CourseEdit.jsx` initializes `form.category = data.categoryID || data.category`; the fallback is a display name and breaks the update payload.
**Fix:** use `categoryID` only; if absent, leave unset. Effort: S.

### P0.6 Category management filters break pagination
`CategoryManagement.jsx` filters/sorts client-side on one server page; `totalPages` uses the unfiltered count.
**Fix:** either pass search/status/sort to the API or fetch-all-then-paginate client-side — not the current hybrid. Effort: M.

### P0.7 Route guards check the wrong permission
`Routes.jsx` — `instructorPlus` routes (create/edit/builder/preview) check `courses.view`, so anyone who can view can reach authoring routes (backend may still reject, but the UI shouldn't offer it).
**Fix:** `/courses/create` → `courses.create`; `/courses/:id/edit|builder|preview` → `courses.edit` / `courses.lessons.manage`. Effort: S.

---

## P1 — High-value UX gaps

### P1.1 Archived courses are a dead end
ArchiveModal promises "can be restored later"; no restore path exists anywhere.
**Fix:** add `RestoreModal` + "Restore to Draft" action on CourseDetail when status is Archived; hide "Publish" while Archived (today both buttons show — confusing). `updateCourse({status:"DRAFT"})` already works. Effort: S.

### P1.2 Tags and duration are un-editable
Both fields exist in the model and render on CourseDetail, but CourseCreate/CourseEdit have no inputs for them.
**Fix:** add a tag input (chip-style, reuse Badge) and duration field to both forms; check `GET/PUT /courses` tag payload shape first. Effort: M.

### P1.3 No status control in CourseEdit
`form.status` is loaded but never rendered; publishing requires a round-trip via CourseDetail modals.
**Fix:** show current status as a read-only badge in CourseEdit with a link/hint to the detail-page actions (keep the guarded modals as the single mutation path). Effort: S.

### P1.4 Learner resume + lazy content loading in CourseViewer
- Always opens lesson 0; should resume at first incomplete lesson (completions are already fetched).
- Loads ALL lesson autosaves upfront (N parallel requests).
**Fix:** initial `activeIndex` = first lesson not in `lessonCompletionStatus`; fetch content on demand per lesson with a small cache. Effort: M.

### P1.5 Mark-course-complete is a serial waterfall
`handleMarkCourseComplete` awaits each lesson in a for-loop.
**Fix:** `Promise.all` the un-completed lessons, single toast + one `loadEnrollment()`. Effort: S.

### P1.6 MyLearning has no error state
API failure shows the "No courses found / Browse" empty state — actively misleading.
**Fix:** error banner + retry button (pattern already exists in `Course.jsx`); depend on `user?.id` not `user` in the effect. Effort: S.

### P1.7 Cover image: file upload
Create/Edit accept only URL or Unsplash. Backend has media upload (RustFS) already.
**Fix:** add upload tab using the existing media upload endpoint; replace the DOM-mutation `onError` fallback with state. Effort: M.

---

## P2 — Consistency & code health

- **P2.1** `fetchCourses` uses raw `fetch` duplicating auth/base-URL logic — migrate to `apiGet` (`http.js`). S
- **P2.2** Delete dead code: `courseBuilderService.js` (entirely unused 4-level mock hierarchy), `mock*` functions in `courseService.js` no longer referenced, `TruckElectricIcon` import, commented-out editor imports. Run after grepping each export for usage. M
- **P2.3** Remove `console.log`/`console.error` from CourseBuilder (2) and CoursePreview (2); route through toast/log util. S
- **P2.4** `useCallback` hygiene in CourseBuilder/CourseViewer (`loadData`, `loadLesson`, `loadEnrollment`) — fixes stale-closure risks. S
- **P2.5** CourseViewer 401/403 path uses `window.location.href` — use the global auth handler (`onAuthError`) like everywhere else. S
- **P2.6** CategoryManagement: toggle-status uses a `Trash2` icon (two trash icons side by side!), `alert()` instead of toasts, success toast sent with `"error"` severity, permission guards use `courses.*` for a category resource. S
- **P2.7** CourseCreate dirty-tracking only fires for title (`description`/`category` bypass `updateForm`); stale draft persists after failed submit. S
- **P2.8** CourseEdit: "Open Course Builder" is a full-reload `<a href>` → use `navigate`; no unsaved-changes guard (CourseCreate has one — extract a `useUnsavedChanges` hook for both). M
- **P2.9** CourseDetail: Lessons-tab completion bars render 0% for non-managers (counts only fetched for managers) — hide bars when `!canManageEnrollments`; remove the Overview enrollment-summary/Enrollment-tab duplication (keep summary stats in Overview, full list in the tab). S
- **P2.10** MyLearning hardcoded hex colors → CSS custom properties per theme rules. S

---

## P3 — Later / needs backend or product decisions

- **P3.1** Rating: hero shows a permanent "—"; either build ratings (backend feature) or drop the stat.
- **P3.2** Course list: add "Recently updated" and "Most enrolled" sorts (needs backend sort params).
- **P3.3** Builder: decide the fate of the Section/Module hierarchy — the mock service models 4 levels, backend/UI support 1 (flat lessons). Either roadmap real sections or delete the concept (P2.2 deletes the mock either way).
- **P3.4** Learner-facing preview route — `/courses/:id/preview` is instructor-only; consider a public "course landing" view of lesson titles for un-enrolled users.
- **P3.5** AdminProgressTracking + learner Dashboard still use mock `fetchEnrollments` — wire to real APIs (same pattern as the MyLearning rewire already done).
- **P3.6** Tests: Playwright journeys for the P0/P1 flows — create→build→publish→enroll→complete→drop; visual regression at 320/768/1024/1440 per testing rules.

---

## Suggested execution order

| Sprint | Items | Theme |
|---|---|---|
| 1 | P0.1–P0.7 | Stop silent breakage (1–2 days) |
| 2 | P1.1, P1.3, P1.5, P1.6, P2.3, P2.6 | Quick wins, visible polish (1 day) |
| 3 | P1.2, P1.4, P1.7 | Authoring + learner experience (2–3 days) |
| 4 | P2.1, P2.2, P2.4, P2.5, P2.7–P2.10 | Code health sweep (1–2 days) |
| 5 | P3.x | Backend-dependent / product calls |

Each sprint should end with: lint clean on touched files, `bun run build` green, and a manual pass of the affected flow.
