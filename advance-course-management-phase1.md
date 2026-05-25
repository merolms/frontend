# Advanced Course Management — Phase 1: Course Creation & Authoring

> Source: `course-management.md` Section 1
> Goal: Evolve the current basic course CRUD into a full-featured course authoring system.
> Approach: Build with static/mock data first. API integration comes later.

---

## Current State

Today the course module supports:
- Course listing (grid view, search, filter, sort, pagination)
- Course create / edit (basic form: title, description, category, tags, cover image)
- Course detail (overview tab, lesson list sidebar)
- Lesson management (CRUD via modal, simple title/description/duration/content)
- Publish / archive / delete actions

What's missing from Section 1:
- Drag-and-drop course builder
- Hierarchical structure (Course > Section > Module > Lesson > Topic)
- Rich text editor for content
- Multimedia support (video, audio, PDF, SCORM, xAPI, interactive HTML)
- AI-assisted course generation
- Template-based course creation
- Reusable content blocks
- Course cloning
- Version history
- Draft autosave
- Multi-language content
- Conditional learning paths / dynamic lesson unlocking
- Branching scenarios
- Gamification elements
- Embedded quizzes inside videos
- AI-generated summaries and notes

---

## Phase 1 Plan — Incremental Delivery

We break Section 1 into 4 sub-phases, each independently shippable.

---

### Sub-Phase 1.1: Hierarchical Course Structure

**Goal:** Replace the flat lesson list with a proper nested structure.

#### Data Model Changes

```
Course
  └── Sections[]          (ordered, collapsible)
        └── Modules[]     (ordered, optional grouping)
              └── Lessons[]  (ordered)
                    └── Topics[]  (ordered, sub-lesson units)
```

Each node has:
- `id`, `title`, `description`, `order`, `status` (draft/published)
- Sections: `isCollapsed` (UI state)
- Lessons: `type` (video/text/quiz/assignment), `duration`, `content`, `isLocked`, `unlockCondition`
- Topics: `type`, `content`, `duration`

#### UI Changes

1. **Course Builder Page** (`/courses/:id/builder`)
   - New dedicated page replacing the current lesson management modal
   - Left panel: tree view of Sections > Modules > Lessons > Topics
   - Right panel: detail editor for the selected node
   - Drag-and-drop reordering within each level (use `react-beautiful-dnd` or native HTML5 DnD) prefer HTML5 Dnd if it is simple
   - Add/remove buttons at each level
   - Collapse/expand sections

2. **Course Detail Page** — Update lesson sidebar to show the tree structure
   - Indent child nodes
   - Show type icons (video, text, quiz, assignment)
   - Show lock icons for conditional content

3. **Course Create/Edit** — Keep the basic form for metadata, add a "Launch Builder" button that navigates to the builder page

#### Files to Create/Modify

```
NEW:
  src/app/containers/course/CourseBuilder/CourseBuilder.jsx
  src/app/containers/course/CourseBuilder/CourseBuilder.scss
  src/app/containers/course/CourseBuilder/components/StructureTree.jsx
  src/app/containers/course/CourseBuilder/components/NodeEditor.jsx
  src/app/containers/course/CourseBuilder/components/DragDropList.jsx
  src/app/services/courseBuilderService.js    (mock data + CRUD for tree nodes)

MODIFY:
  src/app/Routes.jsx                          (add /courses/:id/builder route)
  src/app/containers/course/CourseDetail/CourseDetail.jsx  (tree sidebar)
  src/app/containers/course/CourseEdit/CourseEdit.jsx      (add "Launch Builder" button)
  src/app/services/courseService.js           (add section/module/topic mock data)
```

#### Mock Data Shape

```js
{
  id: 1,
  title: 'Introduction to React',
  sections: [
    {
      id: 's1', title: 'Getting Started', order: 0, isCollapsed: false,
      modules: [
        {
          id: 'm1', title: 'Environment Setup', order: 0,
          lessons: [
            {
              id: 'l1', title: 'Installing Node.js', type: 'video',
              duration: '10 mins', order: 0, status: 'published',
              content: { videoUrl: '', transcript: '' },
              topics: [
                { id: 't1', title: 'Download Node.js', type: 'text', content: '...' },
                { id: 't2', title: 'Verify Installation', type: 'text', content: '...' },
              ]
            },
          ]
        }
      ]
    }
  ]
}
```

---

### Sub-Phase 1.2: Rich Content Editor & Multimedia Support

**Goal:** Replace plain text areas with a rich editor and support multiple content types.

#### Content Types

| Type | Editor | Storage |
|------|--------|---------|
| Text / HTML | Rich text editor (TipTap or Slate) | HTML string |
| Video | URL embed + upload placeholder | URL + metadata |
| Audio | URL embed + upload placeholder | URL + metadata |
| PDF | File upload placeholder | URL |
| Quiz | Link to quiz builder (future) | quizId reference |
| Assignment | Text editor + file upload placeholder | HTML + file URLs |
| Interactive HTML | Code editor (Monaco) | HTML/JS string |
| SCORM / xAPI | Upload placeholder | Package URL |

#### UI Changes

1. **Node Editor** (in CourseBuilder)
   - Content type selector (dropdown: Text, Video, Audio, PDF, Quiz, Assignment, Interactive)
   - Dynamic editor area that changes based on selected type
   - For Text: rich text toolbar (bold, italic, lists, links, images, code blocks)
   - For Video: URL input + preview embed + duration field
   - For Audio: URL input + player preview
   - For PDF: file picker + preview
   - For Quiz/Assignment: placeholder with "Create" button

2. **Course Viewer** (new page: `/courses/:id/learn`)
   - Clean reading/viewing experience
   - Render content based on type
   - Video player (HTML5 `<video>` or iframe embed)
   - PDF viewer (iframe or react-pdf)
   - Text content with proper typography
   - Navigation between lessons (prev/next)
   - Progress tracking (mark as complete)

#### Files to Create/Modify

```
NEW:
  src/app/containers/course/CourseViewer/CourseViewer.jsx
  src/app/containers/course/CourseViewer/CourseViewer.scss
  src/app/containers/course/CourseViewer/components/VideoPlayer.jsx
  src/app/containers/course/CourseViewer/components/PdfViewer.jsx
  src/app/containers/course/CourseViewer/components/TextContent.jsx
  src/app/containers/course/CourseViewer/components/LessonNav.jsx
  src/app/containers/course/CourseBuilder/components/RichTextEditor.jsx
  src/app/containers/course/CourseBuilder/components/ContentTypeSelector.jsx
  src/app/containers/course/CourseBuilder/components/VideoEditor.jsx
  src/app/containers/course/CourseBuilder/components/AudioEditor.jsx
  src/app/containers/course/CourseBuilder/components/PdfEditor.jsx

MODIFY:
  src/app/Routes.jsx                          (add /courses/:id/learn route)
  src/app/containers/course/CourseDetail/CourseDetail.jsx  (add "Preview" button)
  src/app/services/courseBuilderService.js    (add content type handling)
```

#### Dependencies to Add

```
@tiptap/react          (rich text editor)
@tiptap/starter-kit
@tiptap/extension-image
@tiptap/extension-link
react-pdf              (PDF viewing)
```

---

### Sub-Phase 1.3: Course Templates, Cloning, Version History & Autosave

**Goal:** Speed up course creation and enable safe iteration.

#### Features

1. **Course Templates**
   - Pre-defined templates: "Video Course", "Text-Based Course", "Workshop", "Certification Prep"
   - Each template pre-populates the structure with sections/modules
   - "Start from template" option on course creation
   - Custom templates: save any course as a template

2. **Course Cloning**
   - "Clone" button on course detail and listing
   - Deep-copies the entire structure (sections, modules, lessons, topics)
   - Appends " (Copy)" to the title
   - Resets status to "draft"

3. **Version History**
   - Auto-snapshot on every publish
   - Version list: timestamp, author, change summary
   - Restore to any previous version
   - Diff view (optional, stretch goal)

4. **Draft Autosave**
   - Auto-save every 30 seconds while editing
   - Visual indicator: "Saving..." / "Saved 2 min ago" / "Unsaved changes"
   - Store drafts in localStorage (until API is ready)
   - Warn before leaving with unsaved changes

#### Files to Create/Modify

```
NEW:
  src/app/containers/course/CourseTemplates/CourseTemplates.jsx
  src/app/containers/course/CourseTemplates/CourseTemplates.scss
  src/app/containers/course/CourseBuilder/components/VersionHistory.jsx
  src/app/containers/course/CourseBuilder/components/AutosaveIndicator.jsx
  src/app/hooks/useAutosave.js               (generic autosave hook)
  src/app/services/courseTemplateService.js   (mock templates)

MODIFY:
  src/app/containers/course/Course.jsx        (add "Clone" button in card actions)
  src/app/containers/course/CourseDetail/CourseDetail.jsx  (add "Clone" + "Versions" buttons)
  src/app/containers/course/CourseCreate/CourseCreate.jsx  (add template selector)
  src/app/containers/course/CourseBuilder/CourseBuilder.jsx (integrate autosave + versions)
  src/app/services/courseService.js           (add clone, version, template functions)
```

---

### Sub-Phase 1.4: Conditional Learning Paths & Gamification

**Goal:** Add engagement and personalization mechanics.

#### Features

1. **Conditional Learning Paths**
   - Set unlock conditions on lessons/modules:
     - "After completing previous lesson"
     - "After passing quiz X with score Y%"
     - "After Z days from enrollment"
     - "Manually unlocked by instructor"
   - Visual indicators: locked icon, progress requirement tooltip
   - In the Course Viewer: show locked content as "locked" with requirement text

2. **Dynamic Lesson Unlocking**
   - When a user completes a lesson, check if any downstream content should unlock
   - Real-time unlock notification ("New content unlocked!")
   - Progress-based gating

3. **Gamification Elements**
   - Points system: earn points for completing lessons, quizzes, assignments
   - Badges/achievements: "First Course Completed", "Speed Learner", "Perfect Score"
   - Progress bars at course, section, and lesson level
   - Streak tracking: consecutive days of learning
   - Leaderboard (per course or global)

4. **Branching Scenarios**
   - In the course builder: add "decision points" between lessons
   - Based on quiz score or user choice, route to different content
   - Visual flow diagram in builder (stretch goal)

#### Files to Create/Modify

```
NEW:
  src/app/containers/course/CourseBuilder/components/UnlockConditions.jsx
  src/app/containers/course/CourseBuilder/components/BranchingEditor.jsx
  src/app/containers/course/CourseViewer/components/LockedContent.jsx
  src/app/containers/course/CourseViewer/components/ProgressBar.jsx
  src/app/containers/course/CourseViewer/components/AchievementToast.jsx
  src/app/containers/course/CourseViewer/components/Leaderboard.jsx
  src/app/services/gamificationService.js     (mock points, badges, streaks)

MODIFY:
  src/app/containers/course/CourseBuilder/CourseBuilder.jsx (add conditions tab)
  src/app/containers/course/CourseViewer/CourseViewer.jsx   (add gamification UI)
  src/app/containers/course/CourseDetail/CourseDetail.jsx   (show progress + badges)
  src/app/services/courseBuilderService.js    (add unlock conditions to data model)
```

---

## Data Model — Full Course Schema (Target)

```js
{
  id: Number,
  title: String,
  description: String,
  category: String,
  tags: String[],
  coverImage: String,
  status: 'draft' | 'published' | 'archived',
  author: String,
  language: String,               // NEW: multi-language
  estimatedDuration: String,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  createdAt: String,
  updatedAt: String,
  publishedAt: String | null,
  version: Number,                // NEW: version tracking
  templateId: String | null,      // NEW: created from template
  settings: {
    isSequential: Boolean,        // NEW: enforce order
    allowSkip: Boolean,           // NEW: allow skipping lessons
    showProgressBar: Boolean,     // NEW: gamification
    enableDiscussions: Boolean,   // NEW: collaboration
    certificateId: String | null, // NEW: linked certificate
  },
  sections: [
    {
      id: String,
      title: String,
      description: String,
      order: Number,
      status: 'draft' | 'published',
      unlockCondition: {            // NEW: conditional access
        type: 'previous_complete' | 'quiz_pass' | 'date' | 'manual',
        quizId: String | null,
        minScore: Number | null,
        daysAfterEnrollment: Number | null,
      },
      modules: [
        {
          id: String,
          title: String,
          description: String,
          order: Number,
          lessons: [
            {
              id: String,
              title: String,
              description: String,
              type: 'text' | 'video' | 'audio' | 'pdf' | 'quiz' | 'assignment' | 'interactive',
              duration: String,
              order: Number,
              status: 'draft' | 'published',
              isLocked: Boolean,
              unlockCondition: { /* same as section */ },
              content: {
                html: String,           // for text type
                videoUrl: String,       // for video type
                audioUrl: String,       // for audio type
                pdfUrl: String,         // for pdf type
                quizId: String,         // for quiz type
                assignmentPrompt: String, // for assignment type
                interactiveHtml: String,  // for interactive type
              },
              points: Number,             // NEW: gamification
              topics: [
                {
                  id: String,
                  title: String,
                  type: 'text' | 'video' | 'audio',
                  content: String,
                  duration: String,
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  versions: [                        // NEW: version history
    {
      version: Number,
      timestamp: String,
      author: String,
      summary: String,
      snapshot: Object,             // full course snapshot
    }
  ]
}
```

---

## Implementation Order

| Order | Sub-Phase | Est. Complexity | Key Deliverable |
|-------|-----------|-----------------|-----------------|
| 1 | 1.1 Hierarchical Structure | High | Course builder with tree + drag-drop |
| 2 | 1.2 Rich Editor & Multimedia | High | Content type editors + course viewer |
| 3 | 1.3 Templates, Clone, Versions, Autosave | Medium | Template picker, clone button, autosave |
| 4 | 1.4 Conditional Paths & Gamification | Medium | Unlock conditions, progress bars, points |

---

## Route Additions

```
/courses/:id/builder     — Course builder (drag-drop tree + node editor)
/courses/:id/learn       — Course viewer (clean reading/learning experience)
/courses/:id/versions    — Version history (list + restore)
/courses/templates       — Template gallery (browse + create from template)
```

---

## Notes

- All features use static/mock data. The service layer (`courseBuilderService.js`) abstracts data access so swapping to real APIs later is a drop-in replacement.
- The rich text editor choice (TipTap) is framework-agnostic, extensible, and has good React integration.
- Drag-and-drop uses native HTML5 DnD to minimize dependencies. Can upgrade to `react-beautiful-dnd` if needed.
- Gamification data (points, badges, streaks) is stored in localStorage until the user service supports it.
- The course viewer (`/learn`) is a separate concern from the admin builder — it's the student-facing experience.
