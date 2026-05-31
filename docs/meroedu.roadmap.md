# Mero Edu LMS Frontend Roadmap

---

# Mercury — Core Administration Module

## 1. Dashboard / Overview

### Features

- KPI cards
- User statistics
- Course statistics
- Team statistics
- Enrollment charts
- Activity feed
- Recent courses/users
- Responsive dashboard widgets

### Frontend Pages

```txt
/dashboard
```

### AI Agent Tasks

- Generate dashboard layout
- Create reusable chart cards
- Create metrics widgets
- Integrate report APIs

---

## 2. Course Management UI

### Features

- Course listing page
- Course create form
- Course edit form
- Course detail page
- Course archive/publish actions
- Course assignment modal
- Lesson management
- Lesson content management
- Search/filter/sort/pagination

### Frontend Pages

```txt
/courses
/courses/create
/courses/:id
/courses/:id/edit
/courses/:id/lessons
```

### Components

- CourseTable
- CourseForm
- LessonForm
- ContentEditor
- PublishModal
- ArchiveModal

### AI Agent Tasks

- Generate CRUD pages
- Generate dynamic forms
- Generate table hooks
- Generate optimistic updates
- Generate API integration hooks

---

## 3. User Management UI

### Features

- User list
- Create user
- Edit user
- Remove user
- User profile page
- Search/filter
- Team assignment

### Pages

```txt
/users
/users/create
/users/:id
/users/:id/edit
```

### AI Agent Tasks

- Create reusable user forms
- Build user profile layout
- Build assignment dialogs

---

## 4. Team Management UI

### Features

- Team list
- Create team
- Update team
- Remove team
- Team member assignment
- Team detail page

### Pages

```txt
/teams
/teams/create
/teams/:id
```

---

# Venus — Authentication & RBAC

## 1. Authentication System

### Features

- Login page
- Logout flow
- Forgot password
- Reset password
- Session management
- Token refresh handling

### Pages

```txt
/login
/forgot-password
/reset-password
```

### AI Agent Tasks

- Generate auth flow
- Generate auth guards
- Generate token refresh interceptors

---

## 2. RBAC UI

### Features

- Role list
- Create role
- Edit role
- Permission matrix
- Assign roles to users
- Route-level permission control
- Component-level permission control

### Pages

```txt
/roles
/roles/create
/roles/:id
```

### Components

- PermissionMatrix
- RoleAssignmentModal
- ProtectedComponent
- PermissionGuard

### AI Agent Tasks

- Build dynamic permission matrix
- Generate RBAC route wrappers
- Generate conditional rendering utilities

---

# Earth — Multi-Tenant + Quiz + Certificate

## 1. Multi-Tenant Frontend

### Features

- Tenant switcher
- Tenant-aware routing
- Tenant branding
- Tenant configuration UI

### Components

- TenantSelector
- TenantLayout
- OrganizationSettings

### AI Agent Tasks

- Inject tenant context globally
- Generate tenant middleware/hooks

---

## 2. Certificate Management UI

### Features

- Certificate list
- Create certificate
- Edit certificate
- Assign/apply certificate
- Preview certificate
- Template designer

### Pages

```txt
/certificates
/certificates/create
/certificates/:id
```

### Components

- CertificateBuilder
- CertificatePreview
- CertificateTemplateSelector

### AI Agent Tasks

- Generate drag-drop certificate editor
- Generate preview rendering

---

## 3. Quiz Management UI

### Features

- Quiz list
- Quiz creation
- Question builder
- MCQ editor
- Quiz assignment
- Quiz preview
- Quiz analytics

### Pages

```txt
/quizzes
/quizzes/create
/quizzes/:id
```

### Components

- QuizBuilder
- QuestionEditor
- OptionEditor
- QuizPreview

### AI Agent Tasks

- Generate dynamic nested forms
- Generate quiz schema validation
- Generate drag-drop question ordering

---

# Mars — Learning Path + LMS Experience

## 1. Learning Path Management UI

### Features

- Learning path list
- Create learning path
- Update learning path
- Course ordering
- Drag-drop course sequence
- Learning path detail page
- Progress visualization

### Pages

```txt
/learning-paths
/learning-paths/create
/learning-paths/:id
```

### Components

- LearningPathBuilder
- CourseSequenceBoard
- ProgressTracker

### AI Agent Tasks

- Generate drag-drop flows
- Generate visual progress components
- Generate reorder APIs/hooks

---

## 2. Enhanced Dashboard

### Features

- Learning analytics
- Completion analytics
- Quiz analytics
- Team performance
- Export reports

### Components

- AnalyticsCharts
- ExportControls
- ActivityHeatmaps
