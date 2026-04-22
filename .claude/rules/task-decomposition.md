# Task Decomposition Rules

## What is a Vertical Slice?

A **vertical slice** is a business feature that delivers complete end-to-end user value by spanning all technical layers:

- **Database layer**: Schema changes, migrations
- **Business logic layer**: Handlers, services, domain logic
- **API layer**: Routes, validation, error handling
- **Frontend layer**: UI components, pages, state management
- **Test layer**: Unit tests, integration tests, E2E tests
- **Documentation layer**: API docs, user guides, inline comments

**Key principle**: A vertical slice represents one complete user capability, not a technical layer or component.

## Scope Guidelines

### Too Small ❌

**Single API endpoint without user value**

Example: "Add POST /posts endpoint"
- Problem: Just the API layer, no frontend integration
- Problem: User can't actually use the feature
- Problem: Incomplete - missing validation, error handling, tests

### Too Large ❌

**Multiple user stories bundled together**

Example: "Implement social features"
- Problem: Vague scope - what features exactly?
- Problem: Multiple user capabilities mixed together
- Problem: Can't verify independently - too many moving parts
- Problem: Takes too long - delays feedback and integration

### Just Right ✅

**One complete user capability**

Example: "User can like a post"
- ✅ Clear user action with business value
- ✅ Spans all layers (DB → API → Frontend → Tests)
- ✅ Independently verifiable (can test end-to-end)
- ✅ Reasonable size (completable in 1-3 days)
- ✅ Delivers value when merged

## Input/Output Discipline

Every task must explicitly define:

### Input (Requirements)

**What must be true before starting:**
- User story (who, what, why)
- Business context (why this matters)
- Dependencies (what already exists)
- Constraints (limitations, requirements)

**Example:**
```markdown
## Input
- **User Story**: As a logged-in user, I want to like a post
- **Business Context**: Increase engagement metrics
- **Dependencies**: Posts module exists, auth working
- **Constraints**: One like per user per post, real-time updates
```

### Output (Deliverables)

**What will exist after completion:**
- Backend changes (specific endpoints, schema changes)
- Frontend changes (specific components, pages)
- Tests (specific test files, coverage)
- Documentation (specific docs updated)

**Example:**
```markdown
## Output
- **Backend**: POST /posts/:id/like endpoint, likes table
- **Frontend**: LikeButton component, integrated in PostCard
- **Tests**: Like handler tests, LikeButton component tests
- **Docs**: API docs updated with like endpoints
```

## Acceptance Criteria Rules

### Minimum Requirements

- **At least 3 criteria** per task
- **Specific and testable** (not vague or subjective)
- **Cover happy path + error cases**
- **Include functional and technical criteria**

### Good Acceptance Criteria ✅

```markdown
- [ ] AC1: Authenticated user can like a post, API returns 200 and increments count
- [ ] AC2: Clicking like again unlikes the post, count decrements
- [ ] AC3: Unauthenticated user receives 401 error
- [ ] AC4: Frontend shows filled heart for liked posts
- [ ] AC5: Like count updates immediately (optimistic UI)
```

**Why good:**
- Specific actions and expected results
- Testable (can verify with automated or manual tests)
- Covers happy path (AC1, AC2, AC4, AC5) and error case (AC3)
- Includes both backend (AC1-3) and frontend (AC4-5) criteria

### Bad Acceptance Criteria ❌

```markdown
- [ ] Like feature works
- [ ] Code is clean
- [ ] Performance is good
```

**Why bad:**
- Vague - what does "works" mean?
- Subjective - what is "clean" or "good"?
- Not testable - how do you verify?
- No specific actions or expected results

### Criteria Categories

**Functional (user-facing):**
- User can perform action X
- System displays Y when Z happens
- Error message shown for invalid input

**Technical (code quality):**
- API returns correct status codes
- Database constraints prevent invalid data
- TypeScript types are correct, no `any`

**Non-functional (performance, security):**
- Response time under 200ms
- Unauthorized access returns 401
- Input validation prevents XSS

## Cross-Module Tasks

When a feature spans multiple modules (API + frontend):

### Approach 1: Single PR (Recommended)

**When to use:** Feature is tightly coupled, changes are small

**Example:** "User can like a post"
- One PR with both API and frontend changes
- Easier to review as a complete feature
- Faster to merge and deploy

**Structure:**
```
PR: feat(api,h5): add post like feature
- Backend: likes table, like endpoints
- Frontend: LikeButton component
- Tests: API tests + component tests
```

### Approach 2: Sequential PRs

**When to use:** Large changes, API can be deployed independently

**Example:** "User can upload profile photo"
- PR 1: `feat(api): add photo upload endpoint` (API only, returns URL)
- PR 2: `feat(h5): add profile photo upload UI` (uses API from PR 1)

**Requirements:**
- PR 1 must be complete and tested (even if no UI yet)
- PR 2 depends on PR 1 being merged
- Document dependency in PR description

## Task Dependencies

### Independent Tasks (Parallel)

Tasks with no dependencies can be worked on simultaneously:

```
Task A: User can like a post
Task B: User can share a post
Task C: User can bookmark a post
```

All three are independent - no shared code or data.

### Dependent Tasks (Sequential)

Tasks that build on each other must be sequenced:

```
Task 1: User can create a post (must be first)
  ↓
Task 2: User can like a post (depends on posts existing)
  ↓
Task 3: User can see top liked posts (depends on likes existing)
```

**Rules for dependent tasks:**
- Clearly document dependencies in task template
- Wait for dependency PR to merge before starting
- Reference dependency PR in new PR description

## Task Size Guidelines

### Ideal Size

- **Time**: Completable in 1-3 days
- **Files**: 5-15 files changed
- **Lines**: 200-500 lines of code (excluding tests)
- **Commits**: 1-3 commits (following Conventional Commits)

### Too Small

- Less than 3 files changed
- Completable in under 2 hours
- Doesn't deliver user value on its own

**Action:** Combine with related tasks

### Too Large

- More than 20 files changed
- Takes more than 5 days
- Multiple user stories mixed together

**Action:** Split into smaller vertical slices

## Verification Requirements

Every task must include:

### Automated Verification

```bash
pnpm turbo run lint test build  # Must pass
```

- Linting passes (no errors)
- Type checking passes (no TypeScript errors)
- All tests pass (including new tests)
- Build succeeds (all apps compile)

### Manual Verification

Step-by-step instructions to verify the feature works:

```markdown
1. Start dev server: pnpm dev
2. Navigate to /posts
3. Click like button on first post
4. Expected: Heart fills, count increments
```

### Edge Case Verification

List specific edge cases to test:

```markdown
- Empty state: No posts to like
- Error state: Network failure during like
- Auth state: Logged out user attempts to like
```

## Common Mistakes

### Mistake 1: Horizontal Slicing

❌ **Bad:** "Implement database schema for social features"
- Only one layer (database)
- No user value delivered
- Can't verify end-to-end

✅ **Good:** "User can like a post"
- All layers (DB → API → Frontend)
- Complete user capability
- Fully verifiable

### Mistake 2: Technical Tasks

❌ **Bad:** "Refactor posts handler"
- No user-facing change
- No acceptance criteria
- Hard to verify value

✅ **Good:** "Improve post loading performance to under 200ms"
- User-facing benefit (faster loading)
- Measurable criteria (200ms)
- Verifiable (performance tests)

### Mistake 3: Scope Creep

❌ **Bad:** Start with "User can like a post", then add:
- Like notifications
- Like analytics
- Like leaderboard

✅ **Good:** Stick to original scope
- Deliver like feature only
- Create separate tasks for notifications, analytics, leaderboard
- Keep PR focused and reviewable

## Integration with Quality Gates

All tasks must pass existing quality gates:

- **Pre-commit**: Conventional Commits format
- **Pre-merge**: Lint, type-check, test, build all pass
- **Code review**: At least one approval
- **No regressions**: Test coverage does not decrease

See `.claude/rules/quality-gates.md` for full details.

## Task Template

Use `.claude/templates/task-template.md` for all new tasks:

```bash
cp .claude/templates/task-template.md tasks/[feature-name].md
```

Fill out all sections before starting development.
