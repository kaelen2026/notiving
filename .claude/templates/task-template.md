# Task: [Feature Name]

## Input (Requirements)

- **User Story**: As a [role], I want to [action], so that [benefit]
- **Business Context**: Why this feature is needed (business value, user pain point, strategic goal)
- **Dependencies**: What must exist before starting this task (existing features, APIs, data models)
- **Constraints**: Technical or business limitations (performance requirements, platform compatibility, deadlines)

## Output (Deliverables)

- **Backend Changes**: API endpoints, database schema, business logic, middleware
- **Frontend Changes**: UI components, pages, state management, routing
- **Tests**: Unit tests, integration tests, E2E tests (specify coverage)
- **Documentation**: API docs, user docs, inline code comments, README updates

## Acceptance Criteria

- [ ] AC1: [Specific, testable condition - e.g., "API returns 201 status when post is created"]
- [ ] AC2: [Specific, testable condition - e.g., "Frontend displays success message after submission"]
- [ ] AC3: [Specific, testable condition - e.g., "Unauthorized users receive 401 error"]

**Guidelines:**
- Minimum 3 criteria per task
- Must cover happy path + at least one error case
- Must be verifiable (automated test or manual steps)
- Include both functional (user-facing) and technical (code quality) criteria

## Verification Steps

### Automated Checks
1. **Build**: `pnpm turbo run lint test build` passes
2. **Type Safety**: `pnpm exec tsc --noEmit` passes
3. **Tests**: All new tests pass, coverage does not decrease

### Manual Testing
1. [Step 1 - e.g., "Start dev server: pnpm dev"]
2. [Step 2 - e.g., "Navigate to /posts/new"]
3. [Step 3 - e.g., "Fill form and submit"]
4. **Expected Result**: [What should happen - e.g., "Post appears in list, success toast shown"]

### Edge Cases to Verify
- [Edge case 1 - e.g., "Empty form submission shows validation errors"]
- [Edge case 2 - e.g., "Network error displays retry option"]
- [Edge case 3 - e.g., "Duplicate submission is prevented"]

## Files Changed (Estimated)

**Backend:**
- `apps/api/src/modules/[resource]/[resource].handler.ts`
- `apps/api/src/modules/[resource]/[resource].route.ts`
- `apps/api/src/modules/[resource]/[resource].schema.ts`
- `apps/api/src/db/schema.ts` (if schema changes needed)

**Frontend:**
- `apps/h5/src/pages/[Page].tsx`
- `apps/h5/src/components/[Component].tsx`
- `apps/h5/src/lib/apiClient.ts` (if new API calls)

**Shared:**
- `packages/shared/src/schemas/[schema].ts`

**Tests:**
- `apps/api/src/modules/[resource]/[resource].handler.test.ts`
- `apps/h5/src/pages/[Page].test.tsx`

---

## Example 1: Good Vertical Slice ✅

# Task: User can like a post

## Input (Requirements)

- **User Story**: As a logged-in user, I want to like a post, so that I can show appreciation for content I enjoy
- **Business Context**: Engagement feature to increase user interaction and content visibility
- **Dependencies**: 
  - Posts module exists (`apps/api/src/modules/posts/`)
  - Auth middleware functional (`apps/api/src/middleware/auth.ts`)
  - User authentication working in frontend
- **Constraints**: 
  - One like per user per post (no duplicate likes)
  - Like count must update in real-time on frontend
  - Must work on both h5 and web apps

## Output (Deliverables)

- **Backend Changes**: 
  - New `likes` table in database schema
  - POST `/posts/:id/like` endpoint (toggle like/unlike)
  - GET `/posts/:id/likes` endpoint (get like count + user's like status)
  - Update posts list to include like count
- **Frontend Changes**: 
  - Like button component with heart icon
  - Optimistic UI update (instant feedback)
  - Integration in PostCard and PostDetail components
- **Tests**: 
  - Unit tests for like handler (create, delete, duplicate prevention)
  - Integration test for like endpoints
  - Frontend component test for like button
- **Documentation**: 
  - API docs updated with new endpoints
  - Inline comments for like toggle logic

## Acceptance Criteria

- [ ] AC1: Authenticated user can like a post, API returns 200 and increments like count
- [ ] AC2: Clicking like button again unlikes the post, API returns 200 and decrements count
- [ ] AC3: Unauthenticated user receives 401 error when attempting to like
- [ ] AC4: Frontend shows filled heart for liked posts, empty heart for unliked posts
- [ ] AC5: Like count updates immediately in UI (optimistic update)
- [ ] AC6: Duplicate like requests are prevented (database constraint + API validation)

## Verification Steps

### Automated Checks
1. **Build**: `pnpm turbo run lint test build` passes
2. **Type Safety**: `pnpm exec tsc --noEmit` passes
3. **Tests**: `pnpm --filter @notiving/api test` passes with new like tests

### Manual Testing
1. Start API: `pnpm --filter @notiving/api dev`
2. Start frontend: `pnpm --filter h5 dev`
3. Login as test user
4. Navigate to posts list
5. Click heart icon on a post
6. **Expected Result**: Heart fills, count increments by 1
7. Click heart again
8. **Expected Result**: Heart empties, count decrements by 1
9. Refresh page
10. **Expected Result**: Like state persists (heart still empty)

### Edge Cases to Verify
- Logout and attempt to like → 401 error, login prompt shown
- Like post, then unlike, then like again → count accurate, no errors
- Multiple users like same post → count reflects total likes
- Network error during like → error message shown, retry option available

## Files Changed (Estimated)

**Backend:**
- `apps/api/src/db/schema.ts` (add `likes` table)
- `apps/api/src/modules/posts/posts.handler.ts` (add like/unlike logic)
- `apps/api/src/modules/posts/posts.route.ts` (add like endpoints)
- `apps/api/src/modules/posts/posts.handler.test.ts` (add like tests)

**Frontend:**
- `apps/h5/src/components/LikeButton.tsx` (new component)
- `apps/h5/src/components/PostCard.tsx` (integrate like button)
- `apps/h5/src/pages/PostDetail.tsx` (integrate like button)
- `apps/h5/src/lib/apiClient.ts` (add like API calls)

**Shared:**
- `packages/shared/src/schemas/posts.ts` (add like schemas)

---

## Example 2: Bad Task Scope ❌

# Task: Implement social features

## Why This Is Bad:

❌ **Too broad**: "Social features" could mean likes, comments, shares, follows, notifications, etc.

❌ **No clear user story**: Who is the user? What specific action do they want to take?

❌ **Vague deliverables**: "Implement social features" doesn't specify which features or how they work

❌ **No acceptance criteria**: How do you know when "social features" are done?

❌ **Not independently verifiable**: Can't test "social features" as a whole - too many moving parts

❌ **Spans multiple user stories**: Should be broken into separate tasks (likes, comments, shares, etc.)

## How to Fix:

Break into multiple vertical slices:
1. Task: User can like a post (see Example 1 above)
2. Task: User can share a post to external platforms
3. Task: User can follow other users
4. Task: User receives notifications for interactions

Each task delivers one complete user capability and can be verified independently.
