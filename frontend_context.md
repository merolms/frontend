# Frontend Project Context

## Absolute Path
`/Users/dinesh.katwal/claude_code/frontend`

## Project Overview
**Name:** mero-edu-ui  
**Description:** A modernized ReactJS frontend for an educational platform (course management, user management, teams, roles, and learning). The project is in the process of being gradually modernized from legacy patterns to contemporary React practices.

## Current State
- **Framework:** React 19.2.6 (newest)  
- **Build Tool:** Vite 5.1.4 with React and Tailwind CSS 4.3.0  
- **Routing:** React Router 6.22.3 with `createBrowserRouter`  
- **State Management:** Redux Toolkit with RTK Query pattern  
- **UI Library:** Shadcn UI (default theme, slate base color, CSS variables disabled)  
- **Rich Text:** BlockNote (Blockstack editor) for course content  
- **Testing:** Playwright 1.60.0 for E2E  
- **Linting:** ESLint 8.57.0 + React plugins  

## Tech Stack Summary

### Core Dependencies
- **React & DOM:** React 19.2.6, react-dom 19.2.6  
- **Routing:** react-router-dom 6.22.3  
- **State:** @reduxjs/toolkit 2.0.1, react-redux 9.1.0  
- **UI Components:** Radix UI primitives (@radix-ui/react-*)  
- **Rich Text:** @blocknote/core 0.51.3, @blocknote/react 0.51.3, @blocknote/shadcn 0.51.3  
- **Icons:** lucide-react 1.3.0  
- **Forms & Validation:** @tiptap/core 3.23.6, @tiptap/extension-youtube 3.23.6  
- **Drag & Drop:** react-dnd 16.0.1, react-dnd-html5-backend 16.0.1  
- **Notifications:** sonner 2.0.7  
- **Utilities:** class-variance-authority 0.7.1, clsx 2.1.1, immer 10.0.4, tailwind-merge 3.6.0, tailwindcss 4.3.0  
- **Testing:** @faker-js/faker 8.4.1  

### Dev Dependencies
- @playwright/test 1.60.0  
- @vitejs/plugin-react 4.2.1  
- eslint 8.57.0 + react 7.34.0, react-hooks 4.6.0, react-refresh 0.4.6  

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── containers/        # Feature containers (pages)
│   │   │   ├── auth/          # Login, ForgotPassword, ResetPassword
│   │   │   ├── category/      # CategoryManagement
│   │   │   ├── course/        # Course CRUD, builder, preview, viewer, my-learning
│   │   │   ├── role/          # RoleManagement, create, edit
│   │   │   ├── team/          # Team CRUD
│   │   │   └── user/          # User CRUD, profile, settings
│   │   ├── components/        # Reusable components (ProtectedRoute)
│   │   ├── context/           # ThemeContext, ToastContext
│   │   ├── services/          # API services (user, course, dashboard, etc.)
│   │   └── store/             # Redux slices and store
│   ├── components/            # Global components
│   ├── lib/                   # Utilities
│   ├── redux/                 # Redux store, slices, hooks
│   │   ├── slices/
│   │   │   └── authSlice.js   # Auth state management
│   │   └── store.js           # RTK store configuration
│   ├── styles/
│   │   └── tailwind.css       # Tailwind CSS entry point
│   ├── app/
│   │   ├── Routes.jsx         # Route definitions with ProtectedRoute
│   │   ├── Header.jsx         # App header component
│   │   └── index.jsx          # Entry point
│   └── App.jsx                # Root component (placeholder - routes handle rendering)
├── playwright.config.js       # E2E test configuration
├── eslint.config.js           # ESLint config
├── index.html                 # HTML entry point
├── jsconfig.json              # JS path aliases (@/* -> src/*)
├── package.json               # Dependencies and scripts
├── playwright-report/         # Playwright test reports
├── playwright.config.js       # Playwright config
├── theme.md                   # UI theme documentation
├── vite.config.js             # Vite configuration
├── components.json            # Shadcn UI configuration
└── bun.lock                   # Bun package manager lockfile
```

## Key Configuration Files

### vite.config.js
```javascript
- React + Tailwind CSS plugins
- Path alias: @/* -> src/*
- Dev server: port 3000, auto-open
- Build: output to dist/, sourcemaps enabled
```

### jsconfig.json
```json
- Compiler options: baseUrl ".", paths { "@/*": ["src/*"] }
```

### components.json (Shadcn UI)
```json
- Style: default
- Base color: slate
- CSS variables: disabled (no CSS custom properties)
- Aliases: components, utils, ui, lib, hooks
```

## API Layer

### Centralized HTTP Client: `src/app/services/http.js`
- **Base URL:** `http://localhost:9090` (env: VITE_API_BASE)
- **Authentication:** JWT stored in localStorage, injected in Authorization header
- **Response Format:** Backend returns `{ message: "...", data: {...} }` — extracts `data` field
- **Error Handling:** Returns ApiError with status and parsed body.data
- **Auth Error Hook:** Calls `setAuthErrorHandler` callback on 401/403 (clears auth, redirects)
- **Multipart Upload:** `apiUpload()` for file uploads (no Content-Type header)

### Available Methods
```javascript
apiGet(path)              // GET
apiPost(path, data)       // POST
apiPut(path, data)        // PUT
apiPatch(path, data)      // PATCH
apiDelete(path)           // DELETE
apiUpload(path, formData) // Multipart POST
request(path, options)    // Custom fetch
getApiBase()              // Get base URL
```

## Redux Structure

### Store: `src/redux/store.js`
- Uses `configureStore` from @reduxjs/toolkit
- Providers wrapped in `Provider`, `ThemeProvider`, `ToastProvider`
- Auth error handler and session restore on mount

### Auth Slice: `src/redux/slices/authSlice.js`
- Manages auth_token, auth_user, session state
- Actions: `setAuth`, `clearAuth`, `restoreSession`, `onAuthError`
- Selectors: `selectUser`, `selectToken`, `selectAuthenticated`

## Protected Routes

### Component: `src/app/components/ProtectedRoute/ProtectedRoute.jsx`
- Wraps routes that require authentication
- Validates user permissions (e.g., `['dashboard.view']`, `['courses.edit']`)
- Redirects to `/unauthorized` if not authenticated or insufficient permissions

### Route Structure (Routes.jsx)
**Public Routes:**
- `/login`, `/forgot-password`, `/reset-password`, `/unauthorized`

**Protected Routes (require auth + permissions):**
- `/` (Dashboard)
- `/courses` (view), `/courses/create` (create), `/courses/:id/builder/:lessonId?` (edit)
- `/courses/:id` (view), `/courses/:id/edit` (edit)
- `/categories`, `/my-learning`
- `/users` (view), `/users/create` (create), `/users/:id` (view), `/users/:id/edit` (edit)
- `/profile`, `/settings`
- `/teams` (view), `/teams/create`, `/teams/:id` (view), `/teams/:id/edit`
- `/roles` (view), `/roles/create`, `/roles/:id/edit`

## Services (src/app/services/)
- `authService.js` - Authentication endpoints
- `userService.js` - User management
- `courseService.js` - Course CRUD operations
- `dashboardService.js` - Dashboard data
- `enrollmentService.js` - Enrollment tracking
- `categoryService.js` - Category management
- `unsplashService.js` - Image fetching (Unsplash API)
- `courseBuilderService.js` - Builder-specific operations
- `blockService.js` - BlockNote operations
- `chatService.js` - Chat functionality
- `teamService.js` - Team management
- `http.js` - Centralized HTTP client

## Scripts
```bash
npm run dev      # Start Vite dev server (port 3000)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Environment Variables
- `VITE_API_BASE` - Backend API URL (default: http://localhost:9090)

## Build Output
- **Directory:** `dist/`
- **Includes:** sourcemaps (enabled)
- **Served from:** `npm run preview` or CDN

## Key Features
1. **Course Management:** Full CRUD with builder mode, preview mode
2. **Rich Text Editor:** BlockNote for course content creation
3. **Team & Role Management:** Multi-tenant support with RBAC
4. **User Management:** CRUD with profile and settings
5. **Authentication:** JWT-based with session restore
6. **Protected Routes:** Permission-based access control
7. **Drag & Drop:** Course builder with DnD
8. **Responsive Design:** Tailwind CSS with Shadcn UI components

## Recent Modernization Efforts
- Migrated from CRA/Webpack to Vite
- Upgraded to React 19
- Adopted Tailwind CSS 4
- Using Shadcn UI primitives
- Playwright for E2E testing
- Redux Toolkit for state
- Centralized API client

## Known Patterns & Conventions
- Path aliases: `@/*` -> `src/*`
- CSS variables disabled (no `--primary` style, use utility classes)
- Services follow naming: `<entity>Service.js`
- Components in containers: `<Entity>Container.jsx`, `<Entity>Create.jsx`, `<Entity>Edit.jsx`
- Protected routes check both auth + permissions array
- API error handling via ApiError class with status + data fields
- Toast notifications via Sonner (top-right, rich colors)
- Theme context manages dark/light mode
- Auth restore happens on mount via Redux useEffect

## Testing
- **E2E:** Playwright tests in `e2e/` directory
- **Report:** `playwright-report/` (HTML reports)
- **Config:** `playwright.config.js` (browser, test dir, reporter)

## Notes
- The App.jsx is a placeholder — actual rendering happens in index.jsx via router
- Redux store is the single source of truth for auth state
- All API calls go through http.js with automatic auth handling
- Permissions are checked at route level via ProtectedRoute component
- No CSS files other than Tailwind — all styling via utility classes
- Bun is the package manager (bun.lock exists)
- No TypeScript — pure JavaScript
- No SCSS — vanilla CSS + Tailwind utilities

---
**Last Updated:** 2026-05-31  
**Context Source:** Project exploration via terminal, file reads, and config analysis
