# Missing Backend APIs - Corrected Assessment

This is a corrected version of the missing APIs analysis based on actual orval-generated hooks and OpenAPI spec inspection.

## ❌ Incorrect Items in Original Document

The original document had **many false positives**. The following routes **DO EXIST** in the orval-generated API:

### Actually Exist (Not Missing):

- ✅ GET /courses → `useCourseGetAll`
- ✅ GET /courses/:id → `useCourseGetByID`
- ✅ GET /events → `useGetEvents`
- ✅ GET /learning-paths → `useLearningPathGetAll`
- ✅ GET /notifications → Exists
- ✅ GET /rubrics → Exists
- ✅ GET /teams → `useTeamGetAll`
- ✅ GET /teams/:id → `useTeamGetByID`
- ✅ GET /users → Exists
- ✅ GET /roles → Exists
- ✅ GET /certificates → `useGetCourseCertificates` (scoped under courses)

### Naming Convention Differences (Not Missing):

The frontend uses `/:id/edit` pattern, backend uses `PUT /:id`. This is a **frontend convention**, not missing APIs:

- ❌ NOT MISSING: GET/PUT /assignments/:id/edit → Use PUT /assignments/:id
- ❌ NOT MISSING: GET/PUT /courses/:id/edit → Use PUT /courses/:id
- ❌ NOT MISSING: GET/PUT /learning-paths/:id/edit → Use PUT /learning-paths/:id
- ❌ NOT MISSING: GET/PUT /teams/:id/edit → Use PUT /teams/:id
- ❌ NOT MISSING: GET/PUT /users/:id/edit → Use PUT /users/:id

### Scoping Differences (Design Decision):

- ❌ NOT MISSING: GET /lessons → Lessons are intentionally scoped under courses (GET /courses/:id/lessons)
- ❌ NOT MISSING: GET /blocks/:id → Blocks are scoped under lessons, this is by design
- ❌ NOT MISSING: GET /certificates → Scoped as GET /courses/:id/certificates

---

## ✅ ACTUALLY MISSING BACKEND APIs

After removing false positives, here are the **genuinely missing** endpoints that need backend work:

### High Priority (Core Functionality Gaps)

| #   | Missing Endpoint               | Notes                                                                                 | Impact                                                   |
| --- | ------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | GET /teams/:id/available-users | Needed for team member assignment UI                                                  | **HIGH** - Currently using manual service implementation |
| 2   | GET /ai/generate               | Frontend calls this directly; backend has it as POST /blocks/:id/ai/generate (scoped) | **HIGH** - AI generation broken                          |

### Medium Priority (UI-Specific Endpoints)

| #   | Missing Endpoint             | Notes                                                     | Impact                               |
| --- | ---------------------------- | --------------------------------------------------------- | ------------------------------------ |
| 3   | GET /courses/:id/builder     | Course builder UI endpoint                                | **MEDIUM** - Builder UI may not work |
| 4   | GET /courses/:id/builder/:id | Builder detail view                                       | **MEDIUM**                           |
| 5   | GET /courses/:id/learn       | Course learning/view page                                 | **MEDIUM**                           |
| 6   | GET /courses/:id/preview/:id | Course preview                                            | **MEDIUM**                           |
| 7   | GET /attachments             | List all attachments (backend only has upload + download) | **MEDIUM**                           |

### Low Priority (Edge Cases)

| #   | Missing Endpoint                 | Notes                       | Impact                                   |
| --- | -------------------------------- | --------------------------- | ---------------------------------------- |
| 8   | POST /blocks/:id/restore         | Block restore functionality | **LOW**                                  |
| 9   | GET /blocks/:id/versions         | Block version history       | **LOW**                                  |
| 10  | GET /assignments/submissions/:id | Single submission fetch     | **LOW** - Can likely use other endpoints |

---

## 🎯 Course Version Control (Not in OpenAPI Spec)

These endpoints are **not defined in the OpenAPI spec at all**. To add them:

| #   | Missing Endpoint                 | Notes                 | Impact                           |
| --- | -------------------------------- | --------------------- | -------------------------------- |
| 11  | POST /courses/:id/versions       | Create course version | **LOW** - Version control system |
| 12  | GET /courses/:id/versions        | List course versions  | **LOW**                          |
| 13  | GET /courses/:id/versions/latest | Get latest version    | **LOW**                          |
| 14  | DELETE /courses/:id/versions/:id | Delete course version | **LOW**                          |

**Action Required:** Backend team needs to:

1. Add these endpoints to the OpenAPI spec
2. Implement the handlers
3. Run `npm run generate:api` in frontend to regenerate orval hooks

---

## 📊 Summary

| Category                | Original Count | Actually Missing | False Positives    |
| ----------------------- | -------------- | ---------------- | ------------------ |
| Missing Routes          | 10             | 2                | 8 (80% false)      |
| Sub-route differences   | 19             | 6                | 13 (68% false)     |
| Resource collections    | 7              | 3                | 4 (57% false)      |
| Auth mismatches         | 5              | 0                | 5 (100% false)     |
| Notification mismatches | 2              | 0                | 2 (100% false)     |
| **Total**               | **44**         | **11**           | **33 (75% false)** |

**Real backend work needed: 11 endpoints**
**False positives (not missing): 33 endpoints**

---

## 🔧 Recommended Backend Action Items

### Immediate (Do These First)

1. **Add GET /teams/:id/available-users** to OpenAPI spec
   - Currently implemented manually in `teamService.js`
   - This is the highest priority gap

2. **Add GET /ai/generate** or align frontend to use existing POST /blocks/:id/ai/generate\*\*
   - Either create top-level endpoint or update frontend to use scoped endpoint

3. **Add course builder endpoints** if builder UI is critical:
   - GET /courses/:id/builder
   - GET /courses/:id/builder/:id

### Short-term

4. **Add course view/preview endpoints** if these features are used:
   - GET /courses/:id/learn
   - GET /courses/:id/preview/:id

5. **Add GET /attachments** list endpoint\*\*

### Long-term (Optional)

6. **Add course version control** to OpenAPI spec:
   - Add 4 endpoints listed above
   - Regenerate orval after adding to spec

---

## 📝 Notes for Backend Team

- The original analysis was overly aggressive - 75% of "missing" endpoints actually exist
- Most "missing" items are just frontend/backend naming convention differences (`/edit` suffix)
- Use the orval-generated hooks (`meroEduAPI.ts`) as the source of truth for what exists
- Before declaring something "missing", check `src/app/api/orval/meroEduAPI.ts` first
