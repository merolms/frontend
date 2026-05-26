# Frontend Authentication Integration — Implementation Plan

## Goal

Replace the hardcoded `DEMO_MODE = true` in `authService.js` and wire all frontend services to the real backend API at `localhost:9090`.

## Current State

- `authService.js` has `DEMO_MODE = true` hardcoded → all login/register/profile calls use static users
- All service files use `fetch()` directly with wrong API_BASE (`localhost:5000/api`)
- No centralized JWT token injection
- No standardized error handling for 401/403
- Backend returns `{ "message": "success", "data": {...} }` envelope format

## What's Done

- [x] Created `src/app/services/http.js` — centralized API client with JWT injection, envelope parsing, ApiError
- [x] Rewrote `authService.js` — uses `apiGet`/`apiPost`/`apiPut` from http.js, removed DEMO_MODE
- [x] Updated `authSlice.js` — `validateToken()` takes no args (reads JWT from localStorage automatically)
- [x] Created `src/app/services/apiClient.js` — re-exports from http.js

## What Remains

### Phase 1: Wire service files to API client

**Strategy:** Add `USE_MOCK = false` flag to each service. When `false`, call the real API via `apiGet`/`apiPost`/`apiPut`/`apiDelete`. When `true` (or when backend is unreachable), fall back to existing mock data.

#### 1.1 courseService.js (496 lines)
- Replace all `fetch(\`${API_BASE}/courses...\`)` with `apiGet('/courses?...')`
- Keep mock data and `mock*` functions as fallback
- Backend endpoints needed:
  - `GET /courses?start=&limit=` → list courses
  - `GET /courses/:id` → single course
  - `POST /courses` → create
  - `PUT /courses/:id` → update
  - `DELETE /courses/:id` → delete
  - `GET /courses/:id/lessons` → lessons for course
  - `POST /courses/:id/lessons` → create lesson
  - `PUT /courses/:id/lessons/:lessonId` → update lesson
  - `DELETE /courses/:id/lessons/:lessonId` → delete lesson

#### 1.2 userService.js (372 lines)
- Replace `fetch(\`${API_BASE}/users...\`)` with `apiGet('/users...')`
- Backend endpoints needed:
  - `GET /users?start=&limit=` → list users
  - `GET /users/:id` → single user
  - `POST /users` → create (admin)
  - `PUT /users/:id` → update (admin)
  - `DELETE /users/:id` → delete (admin)

#### 1.3 teamService.js (309 lines)
- Replace `fetch(\`${API_BASE}/teams...\`)` with `apiGet('/teams...')`
- Backend endpoints needed:
  - `GET /teams?start=&limit=` → list teams
  - `GET /teams/:id` → single team
  - `POST /teams` → create
  - `PUT /teams/:id` → update
  - `DELETE /teams/:id` → delete

#### 1.4 dashboardService.js (178 lines)
- Replace `fetch(\`${API_BASE}/dashboard...\`)` with `apiGet('...')`
- Backend endpoints TBD (backend may not have these yet — use mock fallback)

#### 1.5 categoryService.js, enrollmentService.js, chatService.js, courseBuilderService.js
- These remain mock/no-backend for now
- Still update `API_BASE` to use `http.js` client for consistency

### Phase 2: Update component-level API calls

Some components (e.g., CourseBuilder, CourseForm) might need to pass auth tokens or update API paths. Verify:
- No hardcoded `fetch()` calls bypass the service layer
- No components reading localStorage directly for tokens

### Phase 3: Add auth error handling → redirect on 401

When any API call returns 401 Unauthorized (expired/invalid JWT):
- Clear auth from Redux store and localStorage
- Redirect to `/login`

This should happen in the http.js client or in a centralized error handler.

### Phase 4: Testing

1. Start backend (`make migrate` + `make dev` in `meroedu/`)
2. Start frontend (`npm run dev` in `frontend/`)
3. Test login with `admin@meroedu.com` / `admin123`
4. Verify JWT is stored and sent in Authorization header
5. Navigate to Dashboard, Courses, Users pages
6. Verify protected routes redirect to login when not authenticated
7.

Logout clears state and redirects to login

## Backend API Endpoints Available

Based on `internal/user/delivery/http/user_handler.go` and other handlers:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | Public | Login, returns {token, user} |
| POST | /auth/register | Public | Register, returns {token, user} |
| GET | /auth/me | JWT | Current user profile |
| PUT | /auth/profile | JWT | Update profile |
| PUT | /auth/password | JWT | Change password |
| POST | /auth/logout | JWT | Logout (client-side) |
| GET | /users | JWT | List users (paginated) |
| GET | /users/:id | JWT | Single user |
| PUT | /users/:id | JWT | Update user (admin) |
| DELETE | /users/:id | JWT | Delete user (admin) |
| GET | /roles | JWT | List roles |
| GET | /courses | JWT | List courses (paginated) |
| GET | /courses/:id | JWT | Single course |
| POST | /courses | JWT | Create course |
| PUT | /courses/:id | JWT | Update course |
| DELETE | /courses/:id | JWT | Delete course |

Response envelope: `{ "message": "success", "data": { ... } }`
Error envelope: `{ "message": "error description" }`

## Key Decisions

1. **Mock fallback:** Services try real API first, fall back to mock on network error
2. **JWT storage:** localStorage keys `auth_token` and `auth_user`
3. **Token injection:** Automatic via `http.js` — no changes needed in service call sites
4. **401 handling:** `http.js` throws `ApiError` with status 401; components/services should catch and dispatch `logoutUser()`
5. **API_BASE:** `http.js` uses `VITE_API_BASE` env var or defaults to `http://localhost:9090/api`
