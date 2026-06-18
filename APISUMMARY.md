# Frontend API Service Refactoring Summary

## Goal

Align all frontend API service files with the backend Swagger documentation at `http://192.168.1.67:9090/swagger/doc.json`.

## Key Findings

### Response Envelope

All backend responses use one of two envelopes:

- `domain.Response` = `{ message, data }` — single entity responses
- `domain.Summaries` = `{ message, data: [...], total }` — list responses

The centralized `http.js` client (`apiGet`/`apiPost`/`apiPut`/`apiDelete`) automatically unwraps `body.data`, so service files receive the `data` object directly.

### Backend Field Naming

- **Database layer**: snake_case (`created_at`, `updated_at`, `image_url`, `lesson_count`, `order_number`, `author_id`, `category_id`)
- **API structs (Swagger)**: camelCase (`createdAt`, `updatedAt`, `imageUrl`, `lessonCount`, `orderNumber`, `authorId`, `categoryId`, `maxPoints`, `passingPoints`, `dueDate`, `allowLate`, etc.)

The backend Go structs use both — some fields have `json:"created_at"` tags, others use camelCase. The frontend must handle both.

---

## Service-by-Service Changes

### 1. courseService.js

| Issue                         | Current                                | Needed                                                        |
| ----------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| `fetchLessons` response       | Checks `data.data` (double-unwrap)     | `apiGet` already unwraps — use `data` directly                |
| `normalizeCourse` timestamps  | Uses `createdAt`/`updatedAt`           | Backend sends `created_at`/`updated_at` (integers)            |
| `normalizeCourse` duration    | Treats as string                       | Backend sends integer (minutes)                               |
| `normalizeLesson` field names | Uses `orderNumber`, `type`, `duration` | Backend sends `displayOrder`, `lessonType`, `durationMinutes` |
| `normalizeLesson` timestamps  | Uses `createdAt`/`updatedAt`           | Backend sends `createdAt`/`updatedAt` as integers             |
| `createLesson` payload        | Sends `orderNumber`                    | Should send `displayOrder`                                    |
| `updateLesson` payload        | Sends `type`                           | Should send `lessonType`                                      |
| `reorderLessons` payload      | Sends `orderNumber`                    | Should send `orderNumber` (correct per ReorderRequest)        |
| `courses/stat`                | Treated as fallback                    | Returns `{ count }` in data                                   |
| Client-side filtering         | Filters `status === "DRAFT"`           | Backend status is integer enum, not string                    |

### 2. authService.js

| Issue               | Current                          | Needed                                         |
| ------------------- | -------------------------------- | ---------------------------------------------- |
| `register` response | Expects `{ user, token }`        | Swagger returns `UserResponse` only (no token) |
| `Role.permissions`  | Stored as comma-separated string | Backend returns array of strings               |

### 3. assignmentService.js

| Issue                      | Current                                          | Needed                                                       |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `getAssignments`           | Uses raw `request()`                             | Should use `apiGet()` for consistency                        |
| `createAssignment` payload | Uses snake_case (`max_points`, `due_date`, etc.) | Backend structs use camelCase (`maxPoints`, `dueDate`, etc.) |
| `updateAssignment` payload | Uses snake_case                                  | Should use camelCase                                         |

### 4. teamService.js

| Issue                     | Current                                                       | Needed                                |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------- |
| `fetchTeams`              | Uses raw `fetch`                                              | Should use `apiGet()` for consistency |
| `addMemberToTeam` payload | Sends `{ userId, teamId, userName, userEmail, role, avatar }` | Swagger expects `{ userId }` only     |

### 5. userService.js

| Issue                 | Current                                | Needed                                                                   |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `fetchUsers`          | Uses raw `fetch`                       | Should use `apiGet()` for consistency                                    |
| `updateUser` response | Returns `body.data` (may be undefined) | PUT returns `Response` with no data — should return raw response or void |
| `deleteUser` response | Uses `apiDelete` (returns data)        | DELETE returns `Response` with no data                                   |

### 6. categoryService.js

| Issue                           | Current                            | Needed                                         |
| ------------------------------- | ---------------------------------- | ---------------------------------------------- |
| `fetchCategories`               | Checks `data.data` (double-unwrap) | `apiGet` already unwraps — use `data` directly |
| `fetchCategoriesWithPagination` | Uses raw `fetch`                   | Should use `apiGet()` for consistency          |

### 7. dashboardService.js

| Issue        | Current          | Needed                                |
| ------------ | ---------------- | ------------------------------------- |
| `fetchStats` | Uses raw `fetch` | Should use `apiGet()` for consistency |

### 8. enrollmentService.js

| Issue                           | Current                        | Needed                                   |
| ------------------------------- | ------------------------------ | ---------------------------------------- |
| `getMyEnrollments`              | Uses `/courses/my/enrollments` | Correct per swagger                      |
| `markLessonCompleteAPI` payload | Sends `{ timeSpentSeconds }`   | Matches `http.CompleteRequest` — correct |

### 9. learningPathService.js

| Issue                  | Current                                                   | Needed                                        |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------- |
| `enrollInLearningPath` | Defined in both enrollmentService and learningPathService | Remove duplicate, keep in learningPathService |

### 10. blockService.js

| Issue                      | Current                   | Needed                                                        |
| -------------------------- | ------------------------- | ------------------------------------------------------------- |
| `saveLessonBlocks` payload | Sends `{ snapshot }` only | Should send `{ lessonId, snapshot }` per `LessonBlockRequest` |
| `generateAIContent` body   | Uses POST `/ai/generate`  | Correct endpoint                                              |

### 11. attachmentService.js

| Issue              | Current                           | Needed              |
| ------------------ | --------------------------------- | ------------------- |
| `uploadAttachment` | Uses `/attachments` with formData | Correct per swagger |
| `getDownloadUrl`   | Constructs URL manually           | Fine as-is          |

### 12. eventService.js

| Issue         | Current            | Needed                                               |
| ------------- | ------------------ | ---------------------------------------------------- |
| All functions | Entirely mock data | Convert to real API calls matching swagger endpoints |

### 13. notificationService.js

| Issue         | Current            | Needed                                               |
| ------------- | ------------------ | ---------------------------------------------------- |
| All functions | Entirely mock data | Convert to real API calls matching swagger endpoints |

---

## New Endpoints Available (Not Yet Used)

### Courses

- `PUT /courses/{id}/publish` — Publish a course
- `PUT /courses/{id}/archive` — Archive a course
- `PUT /courses/{id}/important` — Mark as important
- `POST /courses/{id}/drop` — Drop current user from course
- `GET /courses/{id}/enrollment` — Get enrollment status
- `GET /courses/{id}/progress` — Get user progress
- `GET /courses/{id}/completions` — Get lesson completions
- `GET /courses/my/enrollments` — Get all current user enrollments
- `POST /courses/{id}/admin/enroll-user` — Admin enroll user
- `POST /courses/{id}/admin/enroll-team` — Admin enroll team
- `GET /courses/{id}/admin/enrollments` — List course enrollments
- `GET /courses/{id}/admin/lesson-completion-counts` — Completion counts

### Lessons

- `PUT /courses/{id}/lessons/reorder` — Reorder lessons
- `GET /lessons/{id}` — Get lesson by ID
- `DELETE /lessons/{id}` — Delete lesson
- `POST /lessons/{id}/media` — Upload media
- `GET /lessons/{id}/media/{uuid}` — Get media file

### Events

- Full CRUD: GET/POST `/events`, GET/PUT/DELETE `/events/{id}`
- Attendees: GET/POST `/events/{eventId}/attendees`
- User events: GET `/events/user`, GET `/events/user/attendees`
- Upcoming: GET `/events/upcoming`

### Notifications

- GET/POST `/notifications`
- GET `/notifications/unread`, GET `/notifications/summary`
- PUT `/notifications/read-all`
- GET/PUT/DELETE `/notifications/preferences`

### Media

- `POST /media/upload` — Upload media (preferred over `/attachments`)
- `GET /media/{uuid}` — Get media
- `GET /media/{uuid}/info` — Get media info

### Audit

- GET/POST `/audit/audit-logs`
- GET/POST `/audit/data-exports`

### Certificates

- Full CRUD on `/certificates`
- Templates CRUD on `/certificates/templates`

---

## Refactoring Order

1. **http.js** — No changes needed (wrapper is correct)
2. **courseService.js** — Fix normalize functions, response handling, payload field names
3. **blockService.js** — Fix payload shapes
4. **assignmentService.js** → Fix to use `apiGet`, camelCase payloads
5. **teamService.js** → Fix to use `apiGet`, align member payload
6. **userService.js** → Fix to use `apiGet`, handle void responses
7. **categoryService.js** → Fix response unwrapping
8. **dashboardService.js** → Fix to use `apiGet`
9. **authService.js** → Fix register response, role permissions
10. **enrollmentService.js** → Remove duplicate, add new endpoints
11. **learningPathService.js** → Clean up duplicate enrollment
12. **eventService.js** → Convert from mock to real API
13. **notificationService.js** → Convert from mock to real API
