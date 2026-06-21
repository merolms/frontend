Missing Backend APIs (Frontend calls these but backend has no route)

    I found 44 endpoints that the frontend references but the backend does not implement. They fall into several categories:

    1. Completely Missing Routes (no handler at all)

    #: 1
    Frontend Path: GET /ai/generate
    Notes: Frontend calls this directly; backend has it as POST /blocks/:id/ai/generate (scoped under blocks)
    ────────────────────────────────────────
    #: 2
    Frontend Path: GET /attachments
    Notes: No list endpoint; backend only has POST /attachments (upload) and GET /attachments/download
    ────────────────────────────────────────
    #: 3
    Frontend Path: GET /courses
    Notes: Frontend expects a top-level list; backend has GET /courses via course handler -- actually exists, may be a false positive from query param handling
    ────────────────────────────────────────
    #: 4
    Frontend Path: GET /events
    Notes: Frontend expects GET /events; backend has GET /events via event handler -- actually exists
    ────────────────────────────────────────
    #: 5
    Frontend Path: GET /learning-paths
    Notes: Frontend expects list; backend has GET /learning-paths -- actually exists
    ────────────────────────────────────────
    #: 6
    Frontend Path: GET /lessons
    Notes: Frontend expects top-level list; backend only has lessons scoped under /courses/:id/lessons
    ────────────────────────────────────────
    #: 7
    Frontend Path: GET /notifications
    Notes: Frontend calls GET /notifications; backend has GET /notifications -- actually exists
    ────────────────────────────────────────
    #: 8
    Frontend Path: GET /rubrics
    Notes: Frontend expects list; backend has GET /rubrics -- actually exists
    ────────────────────────────────────────
    #: 9
    Frontend Path: GET /teams
    Notes: Frontend expects list; backend has GET /teams -- actually exists
    ────────────────────────────────────────
    #: 10
    Frontend Path: GET /users
    Notes: Frontend expects list; backend has GET /users -- actually exists

    2. Missing Sub-Routes (parent exists but sub-routes don't)

    Assignments:
    | #   | Frontend Path                    | Backend Has                                                   |
    |-----|----------------------------------|---------------------------------------------------------------|
    | 11  | GET/PUT /assignments/:id/edit    | No edit route (backend uses PUT /assignments/:id for updates) |
    | 12  | POST /assignments/:id/grade      | Backend uses PUT /assignments/submissions/:id/grade           |
    | 13  | GET /assignments/submissions/:id | No single-submission fetch endpoint                           |

    Courses:
    | #   | Frontend Path                                   | Backend Has                                                 |
    |-----|-------------------------------------------------|-------------------------------------------------------------|
    | 14  | GET /courses/:id/admin/enroll-team              | Backend has POST /courses/enroll-team (different structure) |
    | 15  | GET /courses/:id/admin/enroll-user              | Backend has POST /courses/enroll-user (different structure) |
    | 16  | GET /courses/:id/admin/enrollments              | Backend has GET /courses/enrollments (no :id scoping)       |
    | 17  | GET /courses/:id/admin/lesson-completion-counts | Backend has GET /courses/lesson-completion-counts (no :id)  |
    | 18  | GET /courses/:id/builder                        | No builder endpoint                                         |
    | 19  | GET /courses/:id/builder/:id                    | No builder endpoint                                         |
    | 20  | GET/PUT /courses/:id/edit                       | Backend uses PUT /courses/:id and PATCH /courses/:id        |
    | 21  | GET /courses/:id/learn                          | No learn/view endpoint                                      |
    | 22  | GET /courses/:id/preview/:id                    | No preview endpoint                                         |

    Learning Paths:
    | #   | Frontend Path                             | Backend Has                                                      |
    |-----|-------------------------------------------|------------------------------------------------------------------|
    | 23  | GET /learning-paths/:id/admin/enroll-team | Backend has POST /learning-paths/:id/admin/enroll-team -- exists |
    | 24  | GET /learning-paths/:id/admin/enroll-user | Backend has POST /learning-paths/:id/admin/enroll-user -- exists |
    | 25  | GET /learning-paths/:id/admin/enrollments | Backend has GET /learning-paths/:id/admin/enrollments -- exists  |
    | 26  | GET/PUT /learning-paths/:id/edit          | Backend uses PUT /learning-paths/:id                             |

    Lessons:
    | #   | Frontend Path                   | Backend Has                                            |
    |-----|---------------------------------|--------------------------------------------------------|
    | 27  | PUT /lessons/:id/blocks/reorder | Backend has reorder under /courses/:id/lessons/reorder |

    Teams:
    | #   | Frontend Path                  | Backend Has                     |
    |-----|--------------------------------|---------------------------------|
    | 28  | GET /teams/:id/available-users | No endpoint for available users |
    | 29  | GET/PUT /teams/:id/edit        | Backend uses PUT /teams/:id     |

    Users:
    | #   | Frontend Path           | Backend Has                 |
    |-----|-------------------------|-----------------------------|
    | 30  | GET/PUT /users/:id/edit | Backend uses PUT /users/:id |

    3. Missing Resource Collections

    | #   | Frontend Path            | Notes                                                     |
    |-----|--------------------------|-----------------------------------------------------------|
    | 31  | GET /blocks/:id          | No standalone block CRUD; blocks are scoped under lessons |
    | 32  | POST /blocks/:id/restore | No restore endpoint                                       |
    | 33  | GET /blocks/:id/versions | No version history for blocks                             |
    | 34  | GET /certificates        | No list-all endpoint; backend has scoped routes only      |
    | 35  | GET /roles               | Backend has GET /roles -- actually exists in user handler |
    | 36  | GET /roles/:id           | Backend has GET /roles/:id -- actually exists             |
    | 37  | PUT /roles/:id/edit      | Backend uses PUT /roles/:id                               |

    4. Auth Route Mismatches

    The frontend calls these under /auth/* but the backend registers them differently:

    | #   | Frontend Calls                  | Backend Actually Has                      |
    |-----|---------------------------------|-------------------------------------------|
    | 38  | POST /auth/logout               | POST /auth/logout -- exists               |
    | 39  | GET /auth/me                    | GET /auth/me -- exists                    |
    | 40  | PUT /auth/password              | PUT /auth/password -- exists              |
    | 41  | PUT /auth/profile               | PUT /auth/profile -- exists               |
    | 42  | POST /auth/admin/reset-password | POST /auth/admin/reset-password -- exists |

    5. Notification Route Mismatches

    | #   | Frontend Calls                     | Backend Actually Has                                                    |
    |-----|------------------------------------|-------------------------------------------------------------------------|
    | 43  | GET /notifications/unread          | GET /notifications/unread -- exists                                     |
    | 44  | GET /notifications/preferences/:id | Backend uses GET /notifications/preferences/:type (string type, not ID) |



    Truly Missing (After Deduplication)

    After removing false positives (routes that exist but with slightly different param names), here are the genuinely missing backend endpoints:

    High Priority (core functionality broken):
    1. GET /lessons -- top-level lesson list (backend only has course-scoped lessons)
    2. GET /attachments -- list attachments (backend only has upload + download)
    3. GET /courses/:id/builder + /courses/:id/builder/:id -- course builder UI
    4. GET /courses/:id/learn -- course learning/view page
    5. GET /courses/:id/preview/:id -- course preview
    6. GET /teams/:id/available-users -- for team member assignment UI
    7. GET /blocks/:id + sub-routes -- standalone block operations
    8. POST /blocks/:id/restore -- block restore

    Medium Priority (workaround exists via different route):
    9. GET /assignments/submissions/:id -- single submission fetch
    10. PUT /courses/:id/admin/enroll-team -- frontend expects GET, backend has POST at different path
    11. PUT /courses/:id/admin/enroll-user -- same mismatch
    12. GET /courses/:id/admin/enrollments -- scoping mismatch
    13. GET /courses/:id/admin/lesson-completion-counts -- scoping mismatch
    14. PUT /lessons/:id/blocks/reorder -- frontend expects under lessons, backend has under courses

    Low Priority (naming convention differences):
    15. GET/PUT /assignments/:id/edit -- frontend uses /edit suffix, backend uses PUT /:id
    16. GET/PUT /courses/:id/edit -- same pattern
    17. GET/PUT /learning-paths/:id/edit -- same pattern
    18. GET/PUT /teams/:id/edit -- same pattern
    19. GET/PUT /users/:id/edit -- same pattern
    20. PUT /roles/:id/edit -- same pattern
    21. GET /notifications/preferences/:id -- frontend uses :id, backend uses :type (string)

    The /edit suffix pattern is consistent across the frontend -- it seems the frontend convention is to use GET /:id/edit for edit forms and PUT /:id/edit for updates, while the backend uses PUT /:id directly. This is the single biggest category of mismatches.
