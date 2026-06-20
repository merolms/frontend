# Missing Backend APIs from Orval Migration

This document lists backend APIs that are available in the Orval-generated API (`meroEduAPI.ts`) but are **NOT currently being used** in the frontend services or hooks for courses, categories, and teams management.

---

## 📚 COURSES

### ✅ Already Migrated to Orval
- `useCourseGetAll` - List all courses
- `useCourseGetByID` - Get course by ID
- `useCourseCreate` - Create a new course
- `useCourseUpdate` - Update a course
- `useCourseDelete` - Delete a course
- `useCoursePartialUpdate` - Partial update of a course
- `useCourseGetStat` - Get total course count
- `useArchiveCourse` - Archive a course
- `useToggleImportant` - Mark course as important

### ✅ Available in Orval (Import Directly from `@/app/api/orval`)

The following hooks are available from the orval-generated API and can be imported directly in components. They are NOT re-exported through `useEntities.js`:

- **`useGetCourseInsights`** - Get course insights (enrollments, completions, avg progress, quiz stats)
- **`useGetCourseProgress`** - Get all learner progress summaries for a course
- **`useCreateCoursePrerequisite`** - Create a course prerequisite
- **`useDeleteCoursePrerequisite`** - Delete a course prerequisite

### ❌ Missing / Not Yet Migrated

#### Course Versions
- **`useCreateCourseVersion`** - Create a new course version
  - Endpoint: `/courses/{id}/versions`
  - Use Case: Version control for course content

- **`useGetCourseVersions`** - Get all versions of a course
  - Endpoint: `/courses/{id}/versions`
  - Use Case: View version history

- **`useGetLatestCourseVersion`** - Get the latest version of a course
  - Endpoint: `/courses/{id}/versions/latest`
  - Use Case: Display current published version

- **`useDeleteCourseVersion`** - Delete a course version
  - Endpoint: `/courses/{id}/versions/{versionId}`
  - Use Case: Clean up old versions

#### Course Certificates
- **`useGetCourseCertificates`** - Get certificates issued for a course
  - Endpoint: `/courses/{id}/certificates`
  - Use Case: View all certificates for a course

#### Course Events
- **`useGetCourseEvents`** - Get events associated with a course
  - Endpoint: `/courses/{id}/events`
  - Use Case: Link live sessions/events to courses

#### Course Forums
- **`useGetCourseForums`** - Get forums for a course
  - Endpoint: `/courses/{id}/forums`
  - Use Case: Course discussion boards

#### Course Invitations
- **`useGetInvitationsByCourse`** - Get invitations for a course
  - Endpoint: `/courses/{id}/invitations`
  - Use Case: Manage course invitations

#### Course Reordering
- **`useReorderCourses`** - Reorder courses
  - Endpoint: `/courses/reorder`
  - Use Case: Custom course ordering in catalogs

#### Content Revisions
- **`useCreateContentRevision`** - Create content revision
  - Endpoint: `/courses/{id}/revisions`
  - Use Case: Track content changes

- **`useDeleteContentRevision`** - Delete content revision
  - Endpoint: `/courses/{id}/revisions/{revisionId}`
  - Use Case: Remove revision history

#### Enrollment Team Operations
- **`useEnrollTeam`** - Enroll a team in a course
  - Endpoint: `/courses/{id}/enroll-team`
  - Use Case: Bulk team enrollment

- **`useRemoveTeamEnrollment`** - Remove team enrollment
  - Endpoint: `/courses/{id}/enrollments/{teamId}`
  - Use Case: Bulk team unenrollment

#### Team Assignment Submission
- **`useSubmitTeam`** - Submit assignment as a team
  - Endpoint: `/assignments/{id}/submit-team`
  - Use Case: Collaborative assignment submissions

---

## 🏷️ CATEGORIES

### ✅ Already Migrated to Orval
- `useCategoryGetAll` - Get all categories
- `useCategoryGetByID` - Get category by ID
- `useCategoryCreate` - Create a new category
- `useCategoryUpdate` - Update a category
- `useCategoryDelete` - Delete a category
- `useCategoryGetChildren` - Get child categories of a parent
- `useCategoryGetRoots` - Get root categories
- `useCategorySetParent` - Set parent category
- `useCategoryGetStat` - Get total category count

### ❌ Missing / Not Yet Migrated

**No missing category APIs** - All available orval hooks have been migrated.

---

## 👥 TEAMS

### ✅ Already Migrated to Orval
- `useTeamGetAll` - List all teams
- `useTeamGetByID` - Get team by ID
- `useTeamCreate` - Create a new team
- `useTeamUpdate` - Update a team
- `useTeamDelete` - Delete a team
- `useGetMembers` - Get team members
- `useAddMember` - Add member to team
- `useRemoveMember` - Remove member from team
- `useTeamGetStat` - Get total team count

### ❌ Missing / Not Yet Migrated

**No missing team APIs** - All available orval hooks have been migrated.

**Note:** The backend API does not have an endpoint to update team member roles (no PUT `/teams/{id}/members/{userId}`). To change a member's role, you would need to remove and re-add them with the new role.

---

## 📝 Priority Recommendations

### ✅ Completed (Just Migrated)

1. **`useCategoryGetByID`** - Now using orval hook instead of manual implementation
2. **`useTeamGetStat`** - Now imported and exposed in useEntities.js
3. **`useCategoryGetChildren`** - Now imported and wrapper added
4. **`useCategoryGetRoots`** - Now imported and wrapper added
5. **`useCategorySetParent`** - Now imported and wrapper added
6. **`useCategoryGetStat`** - Now imported and wrapper added

### High Priority (Most Useful)

1. **`useGetCourseInsights`** - Essential for course analytics dashboard
2. **`useCourseProgress`** - Useful for tracking learner progress
3. **`useCreateCoursePrerequisite`** & **`useDeleteCoursePrerequisite`** - For course dependencies

### Medium Priority (Nice to Have)

1. **`useEnrollTeam`** & **`useRemoveTeamEnrollment`** - Bulk team enrollment
2. **`useCourseVersions`** - Version control for courses
3. **`useSubmitTeam`** - Team assignment submissions

### Low Priority (Advanced Features)

1. Course content revisions tracking
2. Course certificates
3. Course forums integration
4. Course events linking

---

## 🔧 Migration Tasks

### ✅ Immediate (Completed)

1. ✅ Import `useCategoryGetByID` in `useEntities.js` and remove manual implementation
2. ✅ Import `useTeamGetStat` in `useEntities.js` and expose as hook
3. ✅ Create wrapper for `useCategoryGetChildren` in useEntities.js
4. ✅ Create wrapper for `useCategoryGetRoots` in useEntities.js
5. ✅ Create wrapper for `useCategorySetParent` in useEntities.js
6. ✅ Create wrapper for `useCategoryGetStat` in useEntities.js

### Short-term (Add New Features)

1. Implement course insights dashboard using `useGetCourseInsights`
2. Add course progress tracking using `useGetCourseProgress`
3. Add team stats to dashboard using `useTeamGetStat`
4. Implement category hierarchy support
5. Add course prerequisite management

### Long-term (Advanced Features)

1. Course version control system
2. Content revision history
3. Team enrollment management
4. Course forums integration
5. Certificate management

---

## 📊 Summary

| Module | Total APIs | Migrated | Missing | % Migrated |
|--------|-----------|----------|---------|------------|
| Courses | ~25 | 10 | ~15 | 40% |
| Categories | 9 | 9 | 0 | 100% |
| Teams | 9 | 9 | 0 | 100% |
| **Total** | **~43** | **28** | **~15** | **65%** |

**Note:** This count is approximate based on the APIs analyzed in the orval-generated file. Some APIs may be related to features not yet implemented in the frontend (e.g., forums, certificates, events). All currently available category and team APIs have been fully migrated to orval.
