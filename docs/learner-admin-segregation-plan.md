# Learner & Admin UI Segregation Plan

## 1. Current State Analysis

### Backend Auth System

- **JWT-based authentication** with HS256 tokens
- **Roles**: Administrator, Instructor, Team Lead, Student
- **Permissions**: Granular string-based permissions (e.g., `courses.view`, `courses.create`, `users.edit`)
- **Auth middleware**: `AuthMiddleware()` protects routes, extracts `user_id` from JWT
- **Permission middleware**: Applied per-route in handler files

### Frontend Auth System

- **ProtectedRoute**: Checks `isAuthenticated` + `permissions` array
- **PermissionGuard**: Conditionally renders UI based on permissions
- **Role definitions**: Static `roleDefinitions` in `authService.js` with permission arrays
- **Current sidebar**: Single nav for all roles — no role-based filtering

### Current Problems

1. **No UI role segregation** — All users see the same sidebar and pages
2. **Permission checks only on routes** — No granular UI element hiding
3. **No learner-specific dashboard** — Learners see admin-focused UI
4. **No admin-specific layout** — Admin pages mixed with learner pages
5. **Sidebar shows all nav items** regardless of role
6. **Course pages show admin actions** (edit, delete) to learners
7. **No role-based route grouping** — All routes in flat array

---

## 2. Target Architecture

### Role Definitions

| Role              | Description               | Primary UI                                       |
| ----------------- | ------------------------- | ------------------------------------------------ |
| **Administrator** | Full system access        | Admin dashboard + all features                   |
| **Instructor**    | Course creator + learner  | Instructor dashboard + course builder + learning |
| **Team Lead**     | Team management + learner | Team dashboard + team mgmt + learning            |
| **Student**       | Learning only             | Learner dashboard + courses + progress           |

### Permission Categories

| Category           | Permissions                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Dashboard**      | `dashboard.view`                                                                                                |
| **Courses**        | `courses.view`, `courses.create`, `courses.edit`, `courses.delete`, `courses.publish`, `courses.lessons.manage` |
| **Learning Paths** | `learning-paths.view`, `learning-paths.create`, `learning-paths.edit`                                           |
| **Users**          | `users.view`, `users.create`, `users.edit`, `users.delete`, `users.assign_roles`                                |
| **Teams**          | `teams.view`, `teams.create`, `teams.edit`, `teams.delete`, `teams.manage_members`                              |
| **Roles**          | `roles.view`, `roles.create`, `roles.edit`, `roles.delete`                                                      |
| **Reports**        | `reports.view`, `reports.export`                                                                                |
| **Categories**     | `categories.view`, `categories.manage`                                                                          |
| **Events**         | `events.view`, `events.manage`                                                                                  |

---

## 3. UI Segregation Strategy

### 3.1 Route Grouping by Role

```
/                          → Role-based redirect (dashboard)
/admin/*                   → Admin-only routes
/instructor/*              → Instructor routes
/learner/*                 → Learner routes
/courses                   → Shared (view for all, edit for admin/instructor)
/my-learning               → Learner-only
/profile, /settings       → All authenticated users
```

### 3.2 Sidebar Segregation

**Admin Sidebar:**

- Dashboard
- Courses (list, create, edit)
- Learning Paths
- Users
- Teams
- Roles & Permissions
- Categories
- Events
- Progress Tracking

**Instructor Sidebar:**

- My Dashboard
- My Courses (builder, preview)
- Learning Paths
- My Learning
- My Progress
- Profile, Settings

**Student/Learner Sidebar:**

- My Learning Dashboard
- Browse Courses
- My Learning (enrolled)
- My Progress
- Profile, Settings

**Team Lead Sidebar:**

- Team Dashboard
- Team Members
- My Learning
- My Progress
- Profile, Settings

### 3.3 Layout Components

```
src/components/layouts/
  AdminLayout.jsx          → Admin sidebar + header + content area
  InstructorLayout.jsx     → Instructor sidebar + header + content area
  LearnerLayout.jsx        → Learner sidebar + header + content area
  AuthLayout.jsx           → Login/register pages (no sidebar)
  SharedLayout.jsx         → Profile, settings (minimal sidebar)
```

### 3.4 Permission-Based UI Components

```jsx
// Show/hide based on permission
<Can permission="courses.create">
  <Button>Create Course</Button>
</Can>

// Show/hide based on role
<HasRole roles={["Administrator", "Instructor"]}>
  <AdminPanel />
</HasRole>

// Show different content based on role
<RoleContent
  admin={<AdminDashboard />}
  instructor={<InstructorDashboard />}
  student={<LearnerDashboard />}
/>
```

---

## 4. Implementation Plan

### Phase 1: Core Infrastructure

1. Create role detection utilities (`src/utils/roles.js`)
2. Create permission-based UI components (`src/components/auth/Can.jsx`, `src/components/auth/HasRole.jsx`)
3. Create layout components for each role (`src/components/layouts/`)
4. Update `ProtectedRoute` to support role-based redirects

### Phase 2: Route Restructuring

1. Group routes by role in `Routes.jsx`
2. Add role-based route guards
3. Create role-based index pages (dashboards)
4. Add redirect from `/` to role-appropriate dashboard

### Phase 3: Sidebar & Navigation

1. Create role-specific sidebar configurations
2. Filter nav items based on user permissions
3. Add role indicator in header
4. Create mobile-responsive role-based navigation

### Phase 4: Page-Level Segregation

1. Split Course page into `CourseList.jsx` (admin) and `CourseBrowser.jsx` (learner)
2. Create `LearnerDashboard.jsx` with enrolled courses, progress
3. Create `InstructorDashboard.jsx` with created courses, analytics
4. Create `AdminDashboard.jsx` with system stats, user management
5. Add permission guards to all action buttons (edit, delete, create)

### Phase 5: Fine-Grained UI Permissions

1. Replace all `PermissionGuard` with `Can` component
2. Hide admin actions from learners (edit, delete, publish)
3. Show learner-specific actions (enroll, mark complete, review)
4. Add instructor-specific actions (create, edit own courses)
5. Add role badges to user profiles

---

## 5. File Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Can.jsx              # Permission-based rendering
│   │   ├── HasRole.jsx          # Role-based rendering
│   │   └── RoleGuard.jsx        # Route-level role guard
│   ├── layouts/
│   │   ├── AdminLayout.jsx      # Admin sidebar + header
│   │   ├── InstructorLayout.jsx # Instructor sidebar + header
│   │   ├── LearnerLayout.jsx    # Learner sidebar + header
│   │   ├── AuthLayout.jsx       # Login/register layout
│   │   └── SharedLayout.jsx     # Profile/settings layout
│   └── common/
│       └── RoleBadge.jsx        # Role indicator badge
├── utils/
│   └── roles.js                 # Role detection utilities
├── app/
│   ├── Routes.jsx               # Role-grouped routes
│   └── containers/
│       ├── admin/
│       │   ├── Dashboard.jsx
│       │   ├── CourseManagement.jsx
│       │   └── UserManagement.jsx
│       ├── instructor/
│       │   ├── Dashboard.jsx
│       │   └── MyCourses.jsx
│       └── learner/
│           ├── Dashboard.jsx
│           ├── CourseBrowser.jsx
│           └── MyLearning.jsx
```

---

## 6. Key Components

### 6.1 Can Component

```jsx
// src/components/auth/Can.jsx
const Can = ({ permission, children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth);
  return hasPermission(user, permission) ? children : fallback;
};
```

### 6.2 HasRole Component

```jsx
// src/components/auth/HasRole.jsx
const HasRole = ({ roles, children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth);
  return roles.includes(user?.role) ? children : fallback;
};
```

### 6.3 Role-Based Layout

```jsx
// src/components/layouts/RoleLayout.jsx
const RoleLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  switch (role) {
    case "Administrator":
      return <AdminLayout>{children}</AdminLayout>;
    case "Instructor":
      return <InstructorLayout>{children}</InstructorLayout>;
    case "Team Lead":
      return <TeamLeadLayout>{children}</TeamLeadLayout>;
    case "Student":
      return <LearnerLayout>{children}</LearnerLayout>;
    default:
      return <AuthLayout>{children}</AuthLayout>;
  }
};
```

### 6.4 Role Utilities

```jsx
// src/utils/roles.js
export const isAdmin = (user) => user?.role === "Administrator";
export const isInstructor = (user) => user?.role === "Instructor";
export const isTeamLead = (user) => user?.role === "Team Lead";
export const isStudent = (user) => user?.role === "Student";
export const isAdminOrInstructor = (user) => ["Administrator", "Instructor"].includes(user?.role);
export const canManageCourses = (user) =>
  hasAnyPermission(user, ["courses.create", "courses.edit", "courses.delete"]);
```

---

## 7. Migration Strategy

### Step 1: Add new components (no breaking changes)

- Create `Can.jsx`, `HasRole.jsx`, `RoleGuard.jsx`
- Create `RoleLayout.jsx`, `AdminLayout.jsx`, `InstructorLayout.jsx`, `LearnerLayout.jsx`
- Add `src/utils/roles.js`

### Step 2: Update Routes.jsx

- Add role-based route groups
- Add role-based index page redirects
- Keep existing routes working (backward compatible)

### Step 3: Update Sidebar

- Add role-based nav item filtering
- Add role indicator in header

### Step 4: Update Pages

- Add `Can` guards to admin action buttons
- Add `HasRole` guards to admin-only sections
- Create role-specific dashboards

### Step 5: Cleanup

- Remove unused admin components from learner views
- Consolidate duplicate course list views
- Remove dead code

---

## 8. Backward Compatibility

- Existing routes continue to work
- Existing `ProtectedRoute` and `PermissionGuard` continue to work
- New `Can` and `HasRole` components are additive
- Role-based layouts are opt-in per route
- No changes to backend API contracts
