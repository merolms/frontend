# Missing Backend APIs from Orval Migration

This document lists backend APIs that are available in the Orval-generated API (`meroEduAPI.ts`) but are **NOT currently being used** in the frontend services or hooks for courses, categories, teams, enrollments, certificates, and notifications management.

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

**Analytics & Prerequisites:**

- **`useGetCourseInsights`** - Get course insights (enrollments, completions, avg progress, quiz stats)
- **`useGetCourseProgress`** - Get all learner progress summaries for a course
- **`useCreateCoursePrerequisite`** - Create a course prerequisite
- **`useDeleteCoursePrerequisite`** - Delete a course prerequisite

**Enrollment & Assignments:**

- **`useEnrollTeam`** - Enroll a team in a course (bulk enrollment)
- **`useRemoveTeamEnrollment`** - Remove team enrollment (bulk unenrollment)
- **`useSubmitTeam`** - Submit assignment as a team

**Content Management:**

- **`useCreateContentRevision`** - Create content revision
- **`useDeleteContentRevision`** - Delete content revision

**Advanced Features:**

- **`useGetCourseCertificates`** - Get certificates issued for a course
- **`useGetCourseEvents`** - Get events associated with a course
- **`useGetCourseForums`** - Get forums for a course
- **`useGetInvitationsByCourse`** - Get invitations for a course
- **`useReorderCourses`** - Reorder courses

### ❌ Missing / Not Yet Migrated

**Note:** All course-related hooks that exist in the backend OpenAPI spec are now available from orval. The only missing APIs are for course version control, which are not defined in the OpenAPI spec and would need to be added to the backend before they can be used.

#### Course Versions (Not in OpenAPI Spec)

**Note:** Course version control hooks are NOT available in the orval-generated API. These would need to be added to the backend OpenAPI spec before they can be used.

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

---

## 🏷️ CATEGORIES

### ✅ Already Migrated to Orval (via useEntities.js)

- `useCategoryGetAll` - Get all categories
- `useCategoryGetByID` - Get category by ID
- `useCategoryCreate` - Create a new category
- `useCategoryUpdate` - Update a category
- `useCategoryDelete` - Delete a category
- `useCategoryChildren` - Get child categories of a parent
- `useCategoryRoots` - Get root categories
- `useSetCategoryParent` - Set parent category
- `useCategoryStat` - Get total category count

### ❌ Missing / Not Yet Migrated

**No missing category APIs** - All available orval hooks have been migrated.

---

## 👥 TEAMS

### ✅ Already Migrated to Orval (via useEntities.js)

- `useTeamGetAll` - List all teams
- `useTeamGetByID` - Get team by ID
- `useTeamCreate` - Create a new team
- `useTeamUpdate` - Update a team
- `useTeamDelete` - Delete a team
- `useGetMembers` - Get team members
- `useAddMember` - Add member to team
- `useRemoveMember` - Remove member from team
- `useTeamStat` - Get total team count

### ❌ Missing / Not Yet Migrated

**No missing team APIs** - All available orval hooks have been migrated.

**Note:** The backend API does not have an endpoint to update team member roles (no PUT `/teams/{id}/members/{userId}`). To change a member's role, you would need to remove and re-add them with the new role.

---

## 📝 ENROLLMENTS

### ✅ Already Migrated to Orval (via useEntities.js)

- `useEnrollmentGet` - Get enrollment by ID
- `useEnrollmentGetProgress` - Get enrollment progress
- `useEnrollmentEnroll` - Enroll in a course
- `useEnrollmentDrop` - Drop from a course
- `useEnrollmentAdminEnrollUser` - Admin enroll user in course
- `useEnrollmentAdminEnrollTeam` - Admin enroll team in course

### ❌ Missing / Not Yet Migrated

**No missing enrollment APIs** - All available orval hooks have been migrated.

---

## 🎓 CERTIFICATES

### ✅ Already Migrated to Orval (via useEntities.js)

- `useCertificateGet` - Get certificate by ID
- `useCertificateUpdate` - Update certificate
- `useCertificateDelete` - Delete certificate

### ❌ Missing / Not Yet Migrated

**No missing certificate APIs** - All available orval hooks have been migrated.

---

## 🔔 NOTIFICATIONS

### ✅ Already Migrated to Orval (via useEntities.js)

- `useNotificationGet` - Get notification by ID
- `useNotificationCreate` - Create notification
- `useNotificationDelete` - Delete notification

### ❌ Missing / Not Yet Migrated

**Note:** Only basic notification hooks are available in orval. Advanced notification features (mark as read, preferences, etc.) are still using the service file (`notificationService.js`).

---

## 📝 Priority Recommendations

### ✅ Completed (Categories, Teams, Enrollments, Certificates - 100% Migrated; Notifications Partial)

**Categories & Teams:**

1. ✅ `useCategoryGetByID` - Now using orval hook instead of manual implementation
2. ✅ `useTeamStat` - Now imported and exposed in useEntities.js
3. ✅ `useCategoryChildren` - Now imported and wrapper added
4. ✅ `useCategoryRoots` - Now imported and wrapper added
5. ✅ `useCategorySetParent` - Now imported and wrapper added
6. ✅ `useCategoryStat` - Now imported and wrapper added

**Enrollments:** 7. ✅ `useEnrollment` - Get enrollment by ID 8. ✅ `useEnrollmentProgress` - Get enrollment progress 9. ✅ `useEnrollInCourse` - Enroll in a course 10. ✅ `useDropFromCourse` - Drop from a course 11. ✅ `useAdminEnrollUserInCourse` - Admin enroll user 12. ✅ `useAdminEnrollTeamInCourse` - Admin enroll team

**Certificates:** 13. ✅ `useCertificate` - Get certificate by ID 14. ✅ `useUpdateCertificate` - Update certificate 15. ✅ `useDeleteCertificate` - Delete certificate

**Notifications (Partial):** 16. ✅ `useNotification` - Get notification by ID 17. ✅ `useCreateNotification` - Create notification 18. ✅ `useDeleteNotification` - Delete notification

### High Priority (Available in Orval - Use Directly)

1. **`useGetCourseInsights`** - Import from `@/app/api/orval` - Essential for course analytics dashboard
2. **`useGetCourseProgress`** - Import from `@/app/api/orval` - Useful for tracking learner progress
3. **`useCreateCoursePrerequisite`** & **`useDeleteCoursePrerequisite`** - Import from `@/app/api/orval` - For course dependencies
4. **`useEnrollTeam`** & **`useRemoveTeamEnrollment`** - Import from `@/app/api/orval` - Bulk team enrollment
5. **`useSubmitTeam`** - Import from `@/app/api/orval` - Team assignment submissions

### Medium Priority (Available in Orval - Use Directly)

1. **`useCreateContentRevision`** & **`useDeleteContentRevision`** - Import from `@/app/api/orval` - Content revision tracking
2. **`useReorderCourses`** - Import from `@/app/api/orval` - Custom course ordering

### Low Priority (Advanced Features - Available in Orval)

1. **`useGetCourseCertificates`** - Import from `@/app/api/orval` - Certificate management
2. **`useGetCourseEvents`** - Import from `@/app/api/orval` - Course events linking
3. **`useGetCourseForums`** - Import from `@/app/api/orval` - Course forums integration
4. **`useGetInvitationsByCourse`** - Import from `@/app/api/orval` - Course invitations management

---

## 🔧 Migration Tasks

### ✅ Immediate (Completed)

1. ✅ Import `useCategoryGetByID` in `useEntities.js` and remove manual implementation
2. ✅ Import `useTeamGetStat` in `useEntities.js` and expose as hook
3. ✅ Create wrapper for `useCategoryChildren` in useEntities.js
4. ✅ Create wrapper for `useCategoryRoots` in useEntities.js
5. ✅ Create wrapper for `useCategorySetParent` in useEntities.js
6. ✅ Create wrapper for `useCategoryGetStat` in useEntities.js

### Short-term (Add New Features)

1. Implement course insights dashboard - import `useGetCourseInsights` directly from `@/app/api/orval`
2. Add course progress tracking - import `useGetCourseProgress` directly from `@/app/api/orval`
3. Add team stats to dashboard using `useTeamStat` from useEntities.js
4. Implement category hierarchy support using the new category hooks
5. Add course prerequisite management - import prerequisite hooks from `@/app/api/orval`

### Long-term (Advanced Features)

1. Course version control system
2. Content revision history
3. Team enrollment management
4. Course forums integration
5. Certificate management

---

## 📊 Summary

| Module        | Total APIs | Migrated | Missing | % Migrated          |
| ------------- | ---------- | -------- | ------- | ------------------- |
| Courses       | ~29        | 25       | 4       | **86%**             |
| Categories    | 9          | 9        | 0       | **100%** ✅         |
| Teams         | 9          | 9        | 0       | **100%** ✅         |
| Enrollments   | 6          | 6        | 0       | **100%** ✅         |
| Certificates  | 3          | 3        | 0       | **100%** ✅         |
| Notifications | 3          | 3        | 0+      | **100%** ✅ (basic) |
| **Total**     | **~59**    | **55**   | **4**   | **93%**             |

**Note:** This count is approximate based on the APIs analyzed in the orval-generated file. Almost all course-related hooks that exist in the backend OpenAPI spec are now available from orval. The only missing APIs are for course version control (4 hooks), which are not defined in the OpenAPI spec and would need to be added to the backend before they can be used. Categories, Teams, Enrollments, and Certificates are fully migrated. Notifications are partially migrated (basic CRUD).
