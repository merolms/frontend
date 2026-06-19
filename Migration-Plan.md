Orval Migration Plan - Detailed Analysis

Current State Analysis

✅ What's Already Set Up

  • Orval Configuration: orval.config.js - Already configured to generate React Query hooks
  • Custom Fetcher: http.ts - Bridges orval with existing HTTP client
  • Generated Code: Orval successfully generated:
    • meroEduAPI.ts (959KB) - React Query hooks for all API endpoints
    • meroEduAPI.schemas.ts (44KB) - TypeScript interfaces/schemas
    • Both files located in src/app/api/orval/

📊 Current API Architecture

Manual Service Layer (13 services):

  • userService.ts (TypeScript)
  • courseService.js
  • assignmentService.js
  • learningPathService.js
  • attachmentService.js
  • eventService.js
  • notificationService.js
  • enrollmentService.js
  • authService.js
  • dashboardService.js
  • categoryService.js
  • teamService.js
  • blockService.js

Custom Hooks Layer (6 hook files):

  • useCourses.js
  • useAssignments.js
  • useEnrollments.js
  • useEvents.js
  • useNotifications.js
  • useEntities.js

HTTP Client: http.ts

  • Centralized API wrapper with JWT auth
  • Response envelope parsing { message, data }
  • Error handling with auth error callbacks

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

🎯 Migration Strategy

Phase 1: Setup & Infrastructure (Foundation)

  1. Add npm script for orval generation
    • Add "generate:api": "orval --config orval.config.js" to package.json
    • This ensures regenerating client when OpenAPI spec changes
  2. Create barrel export for orval API
    • Create src/app/api/orval/index.ts to export main hooks and schemas
    • Simplifies imports across the application
  3. Update TypeScript configuration
    • Ensure generated types are properly resolved
    • Add path aliases if needed

Phase 2: Service Migration (Incremental)

Strategy: Migrate service-by-service to minimize risk and allow incremental testing

Migration Priority Order:

  1. Category Service (8 API calls) - Start simple
  2. Dashboard Service (2 API calls) - Low complexity
  3. Attachment Service (3 API calls) - Minimal dependencies
  4. Notification Service (14 API calls) - Isolated functionality
  5. Event Service (18 API calls) - Moderate complexity
  6. Team Service (11 API calls) - Moderate dependencies
  7. Enrollment Service (14 API calls) - Related to courses
  8. Assignment Service (23 API calls) - Complex, test thoroughly
  9. Learning Path Service (14 API calls) - Moderate complexity
  10. Block Service (11 API calls) - Content management
  11. Course Service (20 API calls) - Core feature, extensive testing
  12. Auth Service (13 API calls) - Critical, migrate last
  13. User Service (8 API calls) - Already TypeScript, migrate carefully

For Each Service:

  1. Identify corresponding orval-generated hooks (e.g., useGetAllCategories, useCreateCategory)
  2. Map current service functions to orval hooks
  3. Update custom hooks to use orval hooks instead of service functions
  4. Replace imports in components
  5. Test the migrated service thoroughly
  6. Remove the old service file
  7. Commit changes

Phase 3: Custom Hooks Migration

Strategy: Update existing React Query hooks to use orval-generated hooks directly

Migration Pattern:

// BEFORE (current useCourses.js)
import { fetchCourses } from "@/app/services/courseService";

export const useCourses = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => fetchCourses(params),
  });
};

// AFTER (using orval)
import { useGetAllCourses } from "@/app/api/orval";

export const useCourses = (params = {}) => {
  return useGetAllCourses(params);
};

Custom Hooks to Update:

  1. useCourses.js - Use orval's course hooks
  2. useAssignments.js - Use orval's assignment hooks
  3. useEnrollments.js - Use orval's enrollment hooks
  4. useEvents.js - Use orval's event hooks
  5. useNotifications.js - Use orval's notification hooks
  6. useEntities.js - Update to use orval's entity hooks

Phase 4: Component Migration

Strategy: Update component imports to use new hooks

Impact Analysis: 66+ files import from services, requiring updates:

  • Component files (containers, UI components)
  • Hook files
  • Utility files
  • Redux slices (for auth integration)

Migration Approach:

  1. Group by service (migrate all category-related components together)
  2. Update imports from @/app/services/xxxService to new hook locations
  3. Update function calls to match orval hook signatures
  4. Test component functionality
  5. Commit per service group

Phase 5: Cleanup & Optimization

  1. Remove old service files after successful migration
  2. Keep http.ts - Still needed by orval's custom fetcher
  3. Update query keys - Orval manages its own query keys
  4. Remove custom queryKeys if no longer needed
  5. Update TypeScript types - Use orval-generated schemas
  6. Performance optimization - Leverage orval's built-in query key management

Phase 6: Documentation & Tooling

  1. Update AGENTS.md with orval generation command
  2. Document migration patterns for future reference
  3. Add pre-commit hook (optional) to ensure API spec sync
  4. Update development workflow to include API regeneration

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

🔧 Technical Details

Orval Hook Pattern

Orval generates hooks following this pattern:

// Query hooks
useGetAllCourses(params?, options?)
useGetCourseById(id, options?)

// Mutation hooks
useCreateCourse(options?)
useUpdateCourse(options?)
useDeleteCourse(options?)

Key Differences from Current Setup

  1. Response Handling: Orval handles the { message, data } envelope through our custom fetcher
  2. Type Safety: Full TypeScript support from OpenAPI spec
  3. Query Keys: Orval auto-generates consistent query keys
  4. Error Handling: Built-in error types aligned with OpenAPI responses

Breaking Changes to Anticipate

  1. Function signatures: Orval hooks may have different parameter structures
  2. Response types: May need field mapping (current services do normalization)
  3. Query invalidation: Orval uses different query key structure
  4. Type imports: Need to switch to orval-generated types

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

📋 Implementation Steps

Step 1: Infrastructure Setup

# Add npm script
npm script add "generate:api": "orval --config orval.config.js"

# Create barrel export
# src/app/api/orval/index.ts
export * from './meroEduAPI';
export * from './meroEduAPI.schemas';

Step 2: Test Orval Integration

  • Pick a simple service (categoryService)
  • Create a test component using orval hooks
  • Verify it works correctly
  • This validates the setup before full migration

Step 3: Incremental Service Migration

For each service (following priority order):

  1. Map current functions → orval hooks
  2. Update related custom hooks
  3. Update component imports
  4. Test thoroughly
  5. Remove old service file
  6. Commit

Step 4: Final Cleanup

  • Remove all old service files
  • Clean up unused utilities
  • Update documentation
  • Verify full application functionality

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

⚠️  Risk Mitigation

Potential Issues

  1. Response Format Mismatch: Current services normalize backend responses; orval returns raw API responses
  2. Custom Logic Loss: Some services contain business logic that may need preservation
  3. Type Compatibility: Current TypeScript interfaces may differ from orval schemas
  4. Query Key Conflicts: Mixing orval and manual keys could cause cache issues

Mitigation Strategies

  1. Preserve normalization: Add adapter functions if needed
  2. Extract business logic: Move business logic to separate utility functions
  3. Type mapping: Create type adapters if orval schemas differ significantly
  4. Incremental migration: Never mix old and new for the same service
  5. Comprehensive testing: Test each service migration thoroughly before proceeding

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

📈 Estimated Effort

  • Infrastructure Setup: 1-2 hours
  • Service Migration: 2-4 hours per service (13 services = 26-52 hours)
  • Component Updates: 4-8 hours (spread across service migrations)
  • Testing & Bug Fixes: 8-12 hours
  • Documentation: 1-2 hours

Total Estimated Time: 40-74 hours (spread across multiple sessions)

────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

🚀 Next Steps

Would you like me to:

  1. Start with Phase 1 (Infrastructure setup)?
  2. Begin with a test migration (migrate categoryService first as proof of concept)?
  3. Modify the migration plan (adjust priority or approach)?

Please let me know how you'd like to proceed with this migration!