# Learning Path API Specification

## Base URL
```
/api/v1/learning-paths
```

**Authentication:** All endpoints require Bearer JWT token in `Authorization` header.

**Envelope Format:** All responses follow the standard `{ message, data }` envelope.

---

## Endpoints

### 1. List Learning Paths
```
GET /api/v1/learning-paths?page=1&limit=6&search=react&category=Programming&status=published
```

**Query Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | int | No | 1 | Page number |
| limit | int | No | 6 | Items per page |
| search | string | No | - | Search in title, description, tags |
| category | string | No | - | Filter by category name |
| status | string | No | - | Filter: `draft`, `published`, `archived` |

**Response 200:**
```json
{
  "message": "success",
  "data": {
    "paths": [
      {
        "id": 1,
        "title": "Full-Stack Web Development",
        "description": "Master modern web development from frontend to backend.",
        "image": "https://example.com/images/fullstack.jpg",
        "category": "Programming",
        "difficulty": "Beginner to Advanced",
        "estimatedDuration": "6 months",
        "totalCourses": 5,
        "enrolledCount": 342,
        "rating": 4.8,
        "status": "published",
        "tags": ["react", "nodejs", "javascript", "fullstack"],
        "color": "#6366F1",
        "authorId": 1,
        "authorName": "John Doe",
        "courses": [
          {
            "id": 1,
            "courseId": 101,
            "title": "HTML & CSS Fundamentals",
            "description": "Build beautiful, responsive websites from scratch.",
            "duration": "4 weeks",
            "order": 1,
            "lessons": 24,
            "coverImage": "https://example.com/images/html.jpg",
            "instructor": "Jane Smith"
          }
        ],
        "createdAt": "2025-01-15T00:00:00Z",
        "updatedAt": "2025-03-20T00:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 6,
    "totalPages": 5
  }
}
```

---

### 2. Get Learning Path by ID
```
GET /api/v1/learning-paths/:id
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | int | Yes | Learning path ID |

**Response 200:**
```json
{
  "message": "success",
  "data": {
    "id": 1,
    "title": "Full-Stack Web Development",
    "description": "Master modern web development from frontend to backend.",
    "image": "https://example.com/images/fullstack.jpg",
    "category": "Programming",
    "difficulty": "Beginner to Advanced",
    "estimatedDuration": "6 months",
    "totalCourses": 5,
    "enrolledCount": 342,
    "rating": 4.8,
    "status": "published",
    "tags": ["react", "nodejs", "javascript", "fullstack"],
    "color": "#6366F1",
    "authorId": 1,
    "authorName": "John Doe",
    "courses": [
      {
        "id": 1,
        "courseId": 101,
        "title": "HTML & CSS Fundamentals",
        "description": "Build beautiful, responsive websites from scratch.",
        "duration": "4 weeks",
        "order": 1,
        "lessons": 24,
        "coverImage": "https://example.com/images/html.jpg",
        "instructor": "Jane Smith"
      },
      {
        "id": 2,
        "courseId": 102,
        "title": "JavaScript Essentials",
        "description": "Master JavaScript for web development.",
        "duration": "6 weeks",
        "order": 2,
        "lessons": 36,
        "coverImage": "https://example.com/images/js.jpg",
        "instructor": "Jane Smith"
      }
    ],
    "createdAt": "2025-01-15T00:00:00Z",
    "updatedAt": "2025-03-20T00:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "message": "Not Found",
  "data": "Learning path not found"
}
```

---

### 3. Create Learning Path
```
POST /api/v1/learning-paths
```

**Request Body:**

```json
{
  "title": "Full-Stack Web Development",
  "description": "Master modern web development from frontend to backend. Start with HTML/CSS, progress through JavaScript frameworks, and build production-ready applications.",
  "image": "https://example.com/images/fullstack.jpg",
  "category": "Programming",
  "difficulty": "Beginner to Advanced",
  "estimatedDuration": "6 months",
  "status": "draft",
  "tags": ["react", "nodejs", "javascript", "fullstack"],
  "color": "#6366F1",
  "courses": [
    {
      "courseId": 101,
      "order": 1
    },
    {
      "courseId": 102,
      "order": 2
    },
    {
      "courseId": 103,
      "order": 3
    },
    {
      "courseId": 104,
      "order": 4
    },
    {
      "courseId": 105,
      "order": 5
    }
  ]
}
```

**Field Validation:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | **Yes** | Min 3 chars, max 255 |
| description | string | **Yes** | Min 10 chars |
| image | string | No | Valid URL format |
| category | string | **Yes** | Must be valid category |
| difficulty | string | No | Enum: Beginner, Intermediate, Advanced, Beginner to Advanced |
| estimatedDuration | string | No | Free text, e.g., "6 months" |
| status | string | No | Enum: draft, published, archived. Default: draft |
| tags | string[] | No | Max 10 tags, each max 30 chars |
| color | string | No | Hex color. Default: #6366F1 |
| courses | array | **Yes** | Min 1 item. Each: {courseId: int, order: int} |

**Response 201:**
```json
{
  "message": "Learning path created successfully",
  "data": {
    "id": 6,
    "title": "Full-Stack Web Development",
    "description": "Master modern web development...",
    "image": "https://example.com/images/fullstack.jpg",
    "category": "Programming",
    "difficulty": "Beginner to Advanced",
    "estimatedDuration": "6 months",
    "totalCourses": 5,
    "enrolledCount": 0,
    "rating": 0,
    "status": "draft",
    "tags": ["react", "nodejs", "javascript", "fullstack"],
    "color": "#6366F1",
    "authorId": 1,
    "courses": [
      {"courseId": 101, "order": 1},
      {"courseId": 102, "order": 2},
      {"courseId": 103, "order": 3},
      {"courseId": 104, "order": 4},
      {"courseId": 105, "order": 5}
    ],
    "createdAt": "2025-06-30T10:00:00Z",
    "updatedAt": "2025-06-30T10:00:00Z"
  }
}
```

**Response 422:**
```json
{
  "message": "Validation Error",
  "data": "title is required, courses must have at least 1 item"
}
```

---

### 4. Update Learning Path
```
PUT /api/v1/learning-paths/:id
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | int | Yes | Learning path ID |

**Request Body:** (all fields optional — only send changed fields)

```json
{
  "title": "Updated Full-Stack Path",
  "description": "Updated description...",
  "status": "published",
  "color": "#8B5CF6",
  "courses": [
    {"courseId": 101, "order": 1},
    {"courseId": 104, "order": 2},
    {"courseId": 102, "order": 3}
  ]
}
```

**Response 200:**
```json
{
  "message": "Learning path updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Full-Stack Path",
    "description": "Updated description...",
    "status": "published",
    "color": "#8B5CF6",
    "totalCourses": 3,
    "updatedAt": "2025-06-30T12:00:00Z"
  }
}
```

**Response 404:**
```json
{
  "message": "Not Found",
  "data": "Learning path not found"
}
```

---

### 5. Delete Learning Path
```
DELETE /api/v1/learning-paths/:id
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | int | Yes | Learning path ID |

**Response 200:**
```json
{
  "message": "Learning path deleted successfully"
}
```

**Response 404:**
```json
{
  "message": "Not Found",
  "data": "Learning path not found"
}
```

---

### 6. Get Learning Path Categories
```
GET /api/v1/learning-paths/categories
```

**Response 200:**
```json
{
  "message": "success",
  "data": ["Programming", "Data Science", "Design", "DevOps", "Business"]
}
```

---

### 7. Reorder Courses in Learning Path
```
PUT /api/v1/learning-paths/:id/reorder
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | int | Yes | Learning path ID |

**Request Body:**

```json
{
  "courses": [
    {"courseId": 101, "order": 1},
    {"courseId": 104, "order": 2},
    {"courseId": 102, "order": 3},
    {"courseId": 103, "order": 4}
  ]
}
```

**Response 200:**
```json
{
  "message": "Courses reordered successfully",
  "data": {
    "id": 1,
    "courses": [
      {"courseId": 101, "order": 1},
      {"courseId": 104, "order": 2},
      {"courseId": 102, "order": 3},
      {"courseId": 103, "order": 4}
    ],
    "updatedAt": "2025-06-30T14:00:00Z"
  }
}
```

---

### 8. Enroll User in Learning Path
```
POST /api/v1/learning-paths/:id/enroll
```

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | int | Yes | Learning path ID |

**Response 200:**
```json
{
  "message": "Enrolled successfully",
  "data": {
    "enrollmentId": 1,
    "learningPathId": 1,
    "userId": 4,
    "status": "active",
    "progress": 0,
    "currentCourseId": 101,
    "enrolledAt": "2025-06-30T10:00:00Z"
  }
}
```

**Response 409:**
```json
{
  "message": "Conflict",
  "data": "User is already enrolled in this learning path"
}
```

---

### 9. Get User's Learning Path Progress
```
GET /api/v1/learning-paths/:id/progress
```

**Response 200:**
```json
{
  "message": "success",
  "data": {
    "enrollmentId": 1,
    "learningPathId": 1,
    "userId": 4,
    "status": "active",
    "progress": 45,
    "currentCourseId": 102,
    "currentCourseTitle": "JavaScript Essentials",
    "completedCourses": [
      {"courseId": 101, "title": "HTML & CSS Fundamentals", "completedAt": "2025-05-01"}
    ],
    "remainingCourses": [
      {"courseId": 102, "title": "JavaScript Essentials"},
      {"courseId": 103, "title": "React Mastery"}
    ],
    "enrolledAt": "2025-01-15T00:00:00Z",
    "lastAccessed": "2025-06-28T00:00:00Z",
    "estimatedCompletion": "2025-09-15"
  }
}
```

---

## Database Schema

### `learning_paths`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | NOT NULL | |
| image | VARCHAR(500) | NULL | Cover image URL |
| category | VARCHAR(100) | NOT NULL | Index |
| difficulty | VARCHAR(50) | NULL | ENUM: Beginner, Intermediate, Advanced, Beginner to Advanced |
| estimated_duration | VARCHAR(50) | NULL | e.g., "6 months" |
| total_cours | INT | DEFAULT 0 | Denormalized count |
| enrolled_count | INT | DEFAULT 0 | Denormalized count |
| rating | FLOAT | DEFAULT 0 | 0-5 |
| status | VARCHAR(20) | DEFAULT 'draft' | ENUM: draft, published, archived. Index |
| tags | JSON | NULL | ["react","nodejs"] |
| color | VARCHAR(7) | DEFAULT '#6366F1' | Hex color |
| author_id | BIGINT | FK → users.id | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() ON UPDATE | |

### `learning_path_courses`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| learning_path_id | BIGINT | FK → learning_paths.id, ON DELETE CASCADE | |
| course_id | BIGINT | FK → courses.id | |
| sort_order | INT | NOT NULL | 1, 2, 3... |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**Unique Constraint:** `UNIQUE(learning_path_id, course_id)`

**Index:** `INDEX(learning_path_id, sort_order)`

### `learning_path_enrollments`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| learning_path_id | BIGINT | FK → learning_paths.id | |
| user_id | BIGINT | FK → users.id | |
| status | VARCHAR(20) | DEFAULT 'active' | ENUM: active, completed, dropped |
| progress | INT | DEFAULT 0 | 0-100 percentage |
| current_course_id | BIGINT | FK → courses.id, NULL | |
| enrolled_at | TIMESTAMP | DEFAULT NOW() | |
| completed_at | TIMESTAMP | NULL | |
| last_accessed | TIMESTAMP | DEFAULT NOW() | |

**Unique Constraint:** `UNIQUE(learning_path_id, user_id)`

---

## Error Response Format

All errors follow the same envelope:

```json
{
  "message": "Error type or description",
  "data": "Detailed error info or null"
}
```

**Common HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., already enrolled) |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## Go Struct Reference

```go
type LearningPath struct {
    ID               int64     `json:"id"`
    Title            string    `json:"title" validate:"required,min=3,max=255"`
    Description      string    `json:"description" validate:"required,min=10"`
    Image            string    `json:"image"`
    Category         string    `json:"category" validate:"required"`
    Difficulty       string    `json:"difficulty" validate:"omitempty,oneof=Beginner Intermediate Advanced 'Beginner to Advanced'"`
    EstimatedDuration string   `json:"estimatedDuration"`
    TotalCourses     int       `json:"totalCourses"`
    EnrolledCount    int       `json:"enrolledCount"`
    Rating           float64   `json:"rating"`
    Status           string    `json:"status" validate:"omitempty,oneof=draft published archived"`
    Tags             []string  `json:"tags" validate:"omitempty,dive,max=30"`
    Color            string    `json:"color" validate:"omitempty,ishexcolor"`
    AuthorID         int64     `json:"authorId"`
    Courses          []LearningPathCourse `json:"courses" validate:"required,min=1,dive"`
    CreatedAt        time.Time `json:"createdAt"`
    UpdatedAt        time.Time `json:"updatedAt"`
}

type LearningPathCourse struct {
    ID        int64 `json:"id"`
    CourseID  int64 `json:"courseId" validate:"required"`
    Order     int   `json:"order" validate:"required,min=1"`
}

type CreateLearningPathRequest struct {
    Title            string                  `json:"title" validate:"required,min=3,max=255"`
    Description      string                  `json:"description" validate:"required,min=10"`
    Image            string                  `json:"image"`
    Category         string                  `json:"category" validate:"required"`
    Difficulty       string                  `json:"difficulty"`
    EstimatedDuration string                `json:"estimatedDuration"`
    Status           string                  `json:"status"`
    Tags             []string                `json:"tags"`
    Color            string                  `json:"color"`
    Courses          []LearningPathCourse    `json:"courses" validate:"required,min=1,dive"`
}
```

---

## Sample Mock Data

```json
{
  "id": 1,
  "title": "Full-Stack Web Development",
  "description": "Master modern web development from frontend to backend. Start with HTML/CSS, progress through JavaScript frameworks, and build production-ready applications.",
  "image": "https://picsum.photos/seed/fullstack/400/250",
  "category": "Programming",
  "difficulty": "Beginner to Advanced",
  "estimatedDuration": "6 months",
  "totalCourses": 5,
  "enrolledCount": 342,
  "rating": 4.8,
  "status": "published",
  "tags": ["react", "nodejs", "javascript", "fullstack"],
  "color": "#6366F1",
  "authorId": 1,
  "authorName": "John Doe",
  "courses": [
    {"id": 1, "courseId": 101, "title": "HTML & CSS Fundamentals", "description": "Build beautiful, responsive websites from scratch", "duration": "4 weeks", "order": 1, "lessons": 24, "coverImage": "https://picsum.photos/seed/html/400/250", "instructor": "Jane Smith"},
    {"id": 2, "courseId": 102, "title": "JavaScript Essentials", "description": "Master JavaScript for web development", "duration": "6 weeks", "order": 2, "lessons": 36, "coverImage": "https://picsum.photos/seed/js/400/250", "instructor": "Jane Smith"},
    {"id": 3, "courseId": 103, "title": "React Mastery", "description": "Build modern UIs with React and hooks", "duration": "8 weeks", "order": 3, "lessons": 48, "coverImage": "https://picsum.photos/seed/react/400/250", "instructor": "Jane Smith"},
    {"id": 4, "courseId": 104, "title": "Node.js Backend Development", "description": "Build scalable APIs and server-side applications", "duration": "6 weeks", "order": 4, "lessons": 32, "coverImage": "https://picsum.photos/seed/nodejs/400/250", "instructor": "Bob Wilson"},
    {"id": 5, "courseId": 105, "title": "Database Design & SQL", "description": "Design and query relational databases", "duration": "4 weeks", "order": 5, "lessons": 20, "coverImage": "https://picsum.photos/seed/db/400/250", "instructor": "Bob Wilson"}
  ],
  "createdAt": "2025-01-15T00:00:00Z",
  "updatedAt": "2025-03-20T00:00:00Z"
}
```
