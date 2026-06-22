# Editor Revamp Plan

## Current State Analysis

### Editor Structure
- **Core**: Tiptap-based rich text editor with extensive extension ecosystem
- **Location**: `/src/editor/` (Editor.jsx, extensions, toolbar)
- **CSS**: Mixed in `/src/styles/tailwind.css` (editor-specific styles starting at line 437)
- **Usage**: Used in CourseBuilder (editable) and CoursePreview (read-only)

### Current Features
- 20+ block types (Image, Video, Audio, PDF, Quiz, Flipcard, Scenarios, CodePlayground, etc.)
- Slash commands for quick block insertion
- Drag & drop reordering with drag handles
- Text formatting (bold, italic, underline, strikethrough, highlight, colors)
- Lists (bullet, ordered)
- Tables with insert/delete rows/columns
- Text alignment (left, center, right, justify)
- Undo/Redo
- Link insertion
- Math equations
- Callouts (Info, Warning)
- AI selection highlights and streaming marks
- Theme support (light/dark)

### Current Issues
1. **Separated Preview Page**: CoursePreview is a separate route duplicating editor logic
2. **CSS Bloat**: Editor CSS mixed with global tailwind.css (lines 437-1400)
3. **Toolbar UX**: Cluttered with many buttons in Alert components, inconsistent styling
4. **File Structure**: Extensions scattered across many files
5. **Autosave**: Debounced but could be more robust
6. **Empty State**: Basic empty state message

---

## Revamp Goals

### Primary Goals
1. ✅ **Eliminate separate preview page** - Use toggle mode in CourseBuilder instead
2. ✅ **Clean up CSS** - Extract editor-specific styles to dedicated file
3. ✅ **Modernize toolbar** - Cleaner UX, better organization, consistent design
4. ✅ **Improve file structure** - Better organization of extensions
5. ✅ **Enhanced UX** - Better empty states, improved autosave feedback

### Secondary Goals
- Better mobile experience
- Improved accessibility
- Performance optimizations
- Better error handling

---

## Implementation Plan

## Phase 1: CSS Migration & Cleanup

### 1.1 Extract Editor CSS
**File**: Create `/src/editor/editor.css`

**Actions**:
- Extract all editor-specific CSS from tailwind.css (lines 437-1400)
- Organize into logical sections:
  ```css
  /* Theme Tokens */
  /* ProseMirror Base */
  /* Toolbar */
  /* Drag Handle */
  /* Block Components */
  /* Slash Commands */
  /* Animations */
  /* Responsive */
  ```
- Keep editor-specific tokens in editor.css
- Remove from tailwind.css

**Migration Scope**:
- Editor theme tokens (--editor-*)
- ProseMirror styling
- Drag handle styles
- Block component styles
- Toolbar styles
- Slash command styles
- AI bubble menu styles

**Benefits**:
- Clear separation of concerns
- Easier to maintain editor styles
- Tailwind.css focused on global styles
- Better for theming future work

### 1.2 Update Imports
**Files**: Editor.jsx, CourseBuilder.jsx, CoursePreview.jsx

**Actions**:
```javascript
// Add import to Editor.jsx
import './editor/editor.css';

// Remove from tailwind.css after extraction
```

---

## Phase 2: Eliminate Preview Page

### 2.1 Add Preview Mode to CourseBuilder
**File**: `/src/app/containers/course/CourseBuilder/CourseBuilder.jsx`

**Actions**:
- Add `isPreviewMode` state
- Add toggle button in header (Preview/Edit)
- When in preview mode:
  - Set `editable={false}` on MeroEduEditor
  - Hide LessonPanel (or make it read-only)
  - Add lesson navigation (Previous/Next buttons)
  - Show read-only header

**UI Changes**:
```jsx
// Header toggle
<Button onClick={() => setIsPreviewMode(!isPreviewMode)}>
  {isPreviewMode ? <Edit size={14} /> : <Eye size={14} />}
  {isPreviewMode ? 'Edit' : 'Preview'}
</Button>

// Editor props
<MeroEduEditor
  editable={!isPreviewMode}
  showToolbar={!isPreviewMode}
  {...otherProps}
/>

// Conditional lesson navigation footer (preview mode only)
{isPreviewMode && (
  <div className="lesson-nav-footer">
    <Button onClick={handlePreviousLesson}>Previous</Button>
    <span>{currentLessonIndex + 1} / {lessons.length}</span>
    <Button onClick={handleNextLesson}>Next</Button>
  </div>
)}
```

### 2.2 Remove CoursePreview Route & Component
**Files**: 
- `/src/app/containers/course/CoursePreview/CoursePreview.jsx` (DELETE)
- Route configuration file (REMOVE preview route)

**Actions**:
- Delete CoursePreview.jsx
- Remove preview route from routing config
- Update any links pointing to preview to use builder instead
- Keep keyboard navigation (arrow keys) in CourseBuilder preview mode

### 2.3 Update Navigation Links
**Files**: Any files linking to preview

**Actions**:
```javascript
// Before
navigate(`/courses/${id}/preview/${lessonId}`)

// After
navigate(`/courses/${id}/builder/${lessonId}`)
// Then set preview mode via state
// Or add ?preview=true to URL
```

---

## Phase 3: Toolbar Modernization

### 3.1 Redesign Toolbar Layout
**File**: `/src/editor/Toolbar/ToolbarButtons.jsx`

**Current Issues**:
- Uses Alert components (not semantically correct)
- Cluttered with too many buttons visible at once
- Inconsistent icon sizes
- Popovers for simple operations

**New Design**:
```
[Undo|Redo] | [Text Format Group] | [Heading Select] | [List] | [Alignment] | 
[Color|Highlight] | [Insert Menu] | [Clear]
```

**Groups**:
1. **History**: Undo, Redo (always visible)
2. **Text Format**: Bold, Italic, Underline, Strikethrough (always visible)
3. **Block Structure**: Heading select (dropdown)
4. **Lists**: Bulleted, Numbered (dropdown or toggle)
5. **Alignment**: Left, Center, Right, Justify (dropdown or icon bar)
6. **Text Style**: Color, Highlight (dropdowns)
7. **Insert**: Table, Image, Video, etc. (mega menu)
8. **Actions**: Clear formatting (always visible)

### 3.2 Component Updates
**File**: Create `/src/editor/Toolbar/ToolbarGroup.jsx` (update existing)

**Actions**:
- Replace Alert with proper Button groups
- Use consistent spacing (gap-1 or gap-2)
- Unified icon sizes (h-4 w-4 or h-5 w-5)
- Tooltips for all buttons
- Active state styling

```jsx
// Before
<Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
  <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]">
    <Bold className="h-5 w-5 flex-none" />
  </Button>
</Alert>

// After
<div className="toolbar-group">
  <button
    className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
    onClick={() => editor.chain().focus().toggleBold().run()}
    title="Bold"
  >
    <Bold size={16} />
  </button>
</div>
```

### 3.3 Insert Menu
**File**: Create `/src/editor/Toolbar/InsertMenu.jsx`

**Actions**:
- Consolidate all insert operations into one menu
- Categories: Media, Interactive, Advanced
- Search/filter functionality
- Keyboard shortcuts (CMD+K to open)

**Menu Structure**:
```
Insert Menu (CMD+K)
├── Media
│   ├── Image
│   ├── Video
│   ├── Audio
│   └── File (PDF)
├── Interactive
│   ├── Quiz
│   ├── Flipcard
│   ├── Scenario
│   └── Code Playground
├── Advanced
│   ├── Table
│   ├── Callout
│   ├── Math Equation
│   ├── Link
│   └── Divider
```

### 3.4 Floating Toolbar (Bubble Menu)
**File**: Create `/src/editor/Toolbar/BubbleMenu.jsx`

**Actions**:
- Add floating toolbar for text selection
- Shows text format options when text is selected
- Context-aware (shows relevant options)
- Positioned near selection
- Improved UX for inline formatting

---

## Phase 4: Extension Organization

### 4.1 Reorganize Extension Structure
**Current**: `/src/editor/extensions/[BlockName]/[BlockName].ts`
**Proposed**: 

```
/src/editor/extensions/
├── core/              # Core editor extensions
│   ├── placeholder.ts
│   ├── drag-handle.ts
│   └── slash-commands.ts
├── blocks/            # Block types
│   ├── image/
│   ├── video/
│   ├── audio/
│   ├── quiz/
│   └── ...
├── formatting/        # Text formatting
│   ├── colors.ts
│   ├── highlight.ts
│   └── alignment.ts
└── interactive/       # Interactive components
    ├── flipcard/
    ├── scenarios/
    └── code-playground/
```

**Actions**:
- Move extensions to new structure
- Update imports in Editor.jsx
- Create barrel files (index.ts) for easier imports
- Document extension interfaces

### 4.2 Extension Registry
**File**: Create `/src/editor/extensions/registry.ts`

**Actions**:
- Centralize extension configuration
- Enable/disable extensions by environment
- Plan for premium vs free tiers
- Better extensibility

```typescript
// registry.ts
export const coreExtensions = [
  StarterKit,
  Placeholder,
  DragHandle,
  SlashCommands,
];

export const blockExtensions = [
  ImageBlock,
  VideoBlock,
  AudioBlock,
  // ... blocks
];

export const formattingExtensions = [
  TextAlign,
  TextStyle,
  Highlight,
];

export const getExtensions = (options: ExtensionOptions) => {
  return [
    ...coreExtensions,
    ...blockExtensions,
    ...formattingExtensions,
    // conditional extensions
  ];
};
```

---

## Phase 5: UX Improvements

### 5.1 Enhanced Empty State
**File**: `/src/editor/Editor.jsx`

**Actions**:
- Add visual empty state with suggestions
- Show common block templates
- Drag-and-drop file upload indicator
- Animated placeholder

```jsx
{isEditorEmpty && (
  <div className="editor-empty-state">
    <div className="empty-state-icon">📝</div>
    <p className="empty-state-title">Start creating content</p>
    <p className="empty-state-hint">Press <kbd>/</kbd> for quick blocks</p>
    <div className="quick-actions">
      <Button onClick={insertImage}>
        <ImageIcon /> Add Image
      </Button>
      <Button onClick={insertVideo}>
        <VideoIcon /> Add Video
      </Button>
    </div>
  </div>
)}
```

### 5.2 Improved Autosave Feedback
**File**: `/src/editor/Editor.jsx`

**Current**: Simple "Saved" text
**Proposed**: 
- Visual indicator with animation
- Word count update
- Last saved timestamp
- Saving state with spinner

```jsx
<div className="editor-status-bar">
  {isSaving ? (
    <span className="saving-indicator">
      <Loader2 className="animate-spin" /> Saving...
    </span>
  ) : (
    <span className="saved-indicator">
      <Check /> Saved {lastSavedTime}
    </span>
  )}
  <span className="word-count">{words} words</span>
</div>
```

### 5.3 Mobile Optimizations
**Files**: `/src/editor/Editor.jsx`, `/src/editor/Toolbar/ToolbarButtons.jsx`

**Actions**:
- Responsive toolbar (collapse to menu on mobile)
- Touch-friendly button sizes
- Swipe gestures for navigation (in preview mode)
- Optimized font sizes for mobile
- Improved touch targets

```jsx
// Toolbar
<div className="toolbar desktop-toolbar">
  {/* Full toolbar */}
</div>
<div className="toolbar mobile-toolbar">
  <button onClick={openMobileMenu}>
    <Menu /> Menu
  </button>
</div>
```

### 5.4 Accessibility Improvements
**Files**: All editor components

**Actions**:
- ARIA labels for all buttons
- Keyboard navigation for toolbar
- Screen reader support for blocks
- Focus management
- High contrast mode support

```jsx
<button
  aria-label="Bold text"
  aria-pressed={editor.isActive('bold')}
  onClick={toggleBold}
>
  <Bold />
</button>
```

---

## Phase 6: Performance Optimizations

### 6.1 Lazy Load Extensions
**File**: `/src/editor/Editor.jsx`

**Actions**:
- Lazy load heavy extensions (video, audio, PDF)
- Code splitting with React.lazy
- Reduce initial bundle size

```javascript
const VideoBlock = React.lazy(() => import('./extensions/Video/VideoBlock'));
const AudioBlock = React.lazy(() => import('./extensions/Audio/AudioBlock'));
```

### 6.2 Debounce Optimization
**File**: `/src/editor/Editor.jsx`

**Current**: 1 second debounce
**Proposed**: 
- Adaptive debounce (faster for small edits, slower for large)
- Cancel pending saves on new edits
- Optimistic updates

```javascript
const useAdaptiveDebounce = (value, minDelay = 500, maxDelay = 2000) => {
  const delay = Math.min(value.length * 10, maxDelay) + minDelay;
  // ... implementation
};
```

### 6.3 Virtual Scrolling for Long Documents
**File**: Future enhancement

**Actions**:
- Implement virtual scrolling for very long lessons
- Lazy render blocks outside viewport
- Improve performance for 1000+ block documents

---

## Phase 7: Theme & Styling

### 7.1 Design Tokens
**File**: `/src/editor/editor.css`

**Actions**:
- Use CSS variables for all colors
- Support custom themes
- Easy dark/light mode switching
- Consistent spacing tokens

```css
:root {
  --editor-font-size: 16px;
  --editor-line-height: 1.6;
  --editor-spacing-sm: 0.5rem;
  --editor-spacing-md: 1rem;
  --editor-spacing-lg: 1.5rem;
  --editor-radius: 8px;
  --editor-transition: 150ms ease;
}
```

### 7.2 Component-Specific Styles
**File**: `/src/editor/Editor.css`

**Actions**:
- Scope styles to editor only
- Use .editor-wrapper prefix
- Prevent style leakage
- Better for iframe rendering (future)

```css
.editor-wrapper {
  /* Editor-specific styles */
}

.editor-wrapper .ProseMirror {
  /* ProseMirror styles */
}
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Extract editor CSS to dedicated file
- [ ] Update imports and remove from tailwind.css
- [ ] Test editor still works after CSS migration

### Week 2: Preview Elimination
- [ ] Add preview mode to CourseBuilder
- [ ] Implement edit/preview toggle
- [ ] Add lesson navigation in preview mode
- [ ] Remove CoursePreview component
- [ ] Update routes
- [ ] Update navigation links

### Week 3: Toolbar Redesign
- [ ] Redesign toolbar layout
- [ ] Create new toolbar groups
- [ ] Implement insert menu
- [ ] Add bubble menu
- [ ] Update all buttons with consistent styling

### Week 4: Extension Organization
- [ ] Reorganize extension file structure
- [ ] Create extension registry
- [ ] Update imports
- [ ] Document extension interfaces

### Week 5: UX Improvements
- [ ] Enhanced empty state
- [ ] Improved autosave feedback
- [ ] Mobile optimizations
- [ ] Accessibility improvements

### Week 6: Polish & Testing
- [ ] Performance optimizations
- [ ] Theme improvements
- [ ] Cross-browser testing
- [ ] User testing
- [ ] Bug fixes

---

## Migration Checklist

### Before Starting
- [ ] Backup current code
- [ ] Create feature branch
- [ ] Document current behavior
- [ ] Gather user feedback on pain points

### During Implementation
- [ ] Test editor after each phase
- [ ] Ensure backward compatibility
- [ ] Update documentation
- [ ] Communicate changes to team

### After Completion
- [ ] Remove deprecated code
- [ ] Update user documentation
- [ ] Train team on new features
- [ ] Monitor for issues
- [ ] Gather post-launch feedback

---

## Risks & Mitigations

### Risk 1: Breaking Changes
**Mitigation**: 
- Gradual migration with feature flags
- Keep old code during transition
- Extensive testing

### Risk 2: Performance Regression
**Mitigation**:
- Performance benchmarks before/after
- Lazy loading strategies
- Monitor bundle size

### Risk 3: User Confusion
**Mitigation**:
- UI hints for preview mode
- Clear visual indicators
- Updated documentation

### Risk 4: Extension Compatibility
**Mitigation**:
- Test all extensions
- Keep extension API stable
- Version extension registry

---

## Success Metrics

### UX Metrics
- [ ] Reduce clicks to insert blocks by 30%
- [ ] Improve toolbar clarity (user survey)
- [ ] Reduce page load time by 20%

### Code Quality
- [ ] Reduce CSS size in tailwind.css by 50%
- [ ] Improve code organization score
- [ ] Reduce duplicate code

### User Feedback
- [ ] Positive feedback on preview mode
- [ ] Fewer support tickets for editor issues
- [ ] Higher editor adoption rate

---

## Future Enhancements (Post-Revamp)

1. **Collaboration Mode**: Real-time collaborative editing
2. **AI Assistant**: Enhanced AI writing assistant integration
3. **Templates**: Pre-built lesson templates
4. **Export Options**: PDF, DOCX, Markdown export
5. **Version History**: Track changes over time
6. **Comments**: Add comments to specific sections
7. **Block Library**: Reusable block components
8. **Custom Themes**: Allow course-level theming
9. **Offline Support**: PWA for offline editing
10. **Analytics**: Track engagement with content blocks



Additional Plan:
WS1: TypeScript foundation — shared types, tsconfig, migrate leaf utils

WS1: Migrate extension schemas + components to TS

WS1: Migrate Toolbar + Editor.jsx to TS

WS2: Fix Editor.jsx bugs (useDebounce, onStatsChange, dark prop, PasteFileHandler)

WS2: Replace custom DragHandle with official extension

WS2: Clean up empty CSS stubs + stale comments

WS3: Decompose ToolbarButtons into groups + dedupe palette + unify icons

WS3: Standardize extension folders + central registration factory

WS3: Add EditorErrorBoundary + remove dead code

WS4: Unify dual color-token systems + toolbar/block polish + dark audit

WS5: Lazy-load heavy NodeViews + memoization + tests

Final: tsc --noEmit + lint + smoke test