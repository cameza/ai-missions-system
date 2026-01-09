# Ticket Breakdown Workflow

This workflow guides the TPM through breaking down approved specs into executable tickets in Linear.

## Prerequisites
- Approved PRD
- Approved Tech Spec
- Approved UI Spec
- Linear project configured
- Linear API/MCP access in Windsurf

## Spec-Driven Context
In a spec-driven model, tickets are **execution artifacts** that derive from approved capability specs. Specs define "what" and "why"; tickets define "who" and "when."

**Your job**: Translate approved specs into a sequenced, dependency-aware execution plan.

## Step 1: Review All Specifications (30 minutes)

**Read PRD:**
- What's the capability being built?
- What are the must-have requirements (MVP)?
- What's out of scope?
- What are the success metrics?

**Read Tech Spec:**
- What's the component architecture?
- What are the data models?
- What's the tech stack?
- What are the technical risks?
- What are the effort estimates?

**Read UI Spec:**
- What screens/views exist?
- What components are needed?
- What interactions are specified?
- What states must be handled?

**Extract:**
- All deliverables (features, components, integrations)
- All constraints (technical, design, accessibility)
- All dependencies (what depends on what)
- All phases (setup, foundation, features, polish)

## Step 2: Identify Work Streams (30 minutes)

**Group work into logical streams:**

### Example Work Streams
1. **Project Setup**: Initialization, tooling, configuration
2. **Data Layer**: Models, storage, state management
3. **UI Components**: Reusable components, design system
4. **Feature: [Name]**: Specific user-facing capability
5. **Feature: [Name]**: Another capability
6. **Polish & Quality**: Accessibility, performance, testing

**For each stream:**
- What's the goal?
- What tickets belong here?
- What's the priority?
- What depends on this?

## Step 3: Define Implementation Phases (20 minutes)

**Standard phases:**

### Phase 0: Setup (MVP prerequisite)
- Project initialization
- Dev environment setup
- Tooling configuration
- Base folder structure
- First component rendering

**Goal**: Can start building features

### Phase 1: Foundation (MVP prerequisite)
- Data models defined
- Storage service implemented
- State management setup
- Base UI components created
- Routing configured (if needed)

**Goal**: Infrastructure ready for features

### Phase 2: Core Features (MVP required)
- Primary user flows implemented
- Must-have features built
- Basic error handling
- Data persistence working

**Goal**: MVP feature complete

### Phase 3: Enhancement (Post-MVP)
- Secondary features
- Advanced error handling
- Loading/empty states refined
- Edge cases handled
- Accessibility improvements

**Goal**: Production-ready quality

### Phase 4: Testing & Deploy (Final)
- QA testing
- Bug fixes
- Performance optimization
- Deployment
- Documentation

**Goal**: Shipped and validated

## Step 4: Create Ticket Hierarchy in Linear (30 minutes)

**Use Linear API/MCP to create:**

### Epic (One per mission)
```javascript
// Using Linear MCP
const epic = await linear.createIssue({
  title: "Week 1: Resolution Tracker",
  description: `
# Overview
Build a personal resolution tracker with goal creation, progress logging, and tracking.

## Documentation
- PRD: [link]
- Tech Spec: [link]
- UI Spec: [link]

## Success Criteria
- User can create/edit/delete resolutions
- User can log progress updates
- Data persists across sessions
- Responsive on mobile/desktop
- WCAG AA accessible
  `,
  teamId: "team-id",
  projectId: "project-id",
  labelIds: ["mission", "week-1"],
});
```

### Features (3-7 per Epic)
```javascript
// Create features under Epic
const features = [
  {
    title: "Project Setup & Infrastructure",
    description: "Initialize project with Vite, React, TypeScript, Tailwind",
    priority: 0, // Highest
  },
  {
    title: "Data Layer",
    description: "Data models, storage service, state management",
    priority: 1,
  },
  {
    title: "Goal Management",
    description: "Create, read, update, delete goals",
    priority: 2,
  },
  {
    title: "Progress Tracking",
    description: "Log and view progress updates",
    priority: 3,
  },
  {
    title: "UI Polish & Accessibility",
    description: "Responsive design, accessibility, performance",
    priority: 4,
  },
];

for (const feature of features) {
  await linear.createIssue({
    title: feature.title,
    description: feature.description,
    teamId: "team-id",
    projectId: "project-id",
    parentId: epic.id,
    labelIds: ["feature"],
    priority: feature.priority,
  });
}
```

## Step 5: Break Down Features into Tasks (1-2 hours)

**For each feature, create 3-10 tasks**

Use `/templates/ticket-template.md` structure

### Task Sizing Guidelines
- **XS (2-3 hours)**: Simple component, basic config
- **S (4-6 hours)**: Standard component, integration
- **M (1 day)**: Complex feature, multiple components
- **L (2 days)**: Major feature, full flow
- **If > L**: Break down further

### Example: "Project Setup" Feature Breakdown

**Task 1: Initialize Vite Project (XS)**
```markdown
## Description
Initialize a new Vite project with React and TypeScript template.

## Acceptance Criteria
- [ ] Project created with `npm create vite@latest`
- [ ] React and TypeScript configured
- [ ] Dev server starts successfully (`npm run dev`)
- [ ] TypeScript compiles with no errors
- [ ] Can render "Hello World" component

## Technical Notes
- Use Vite 5.x
- Enable TypeScript strict mode
- Use React 18+

## Estimate
XS (2 hours)
```

**Task 2: Configure Tailwind CSS (XS)**
```markdown
## Description
Install and configure Tailwind CSS for styling.

## Acceptance Criteria
- [ ] Tailwind installed via npm
- [ ] tailwind.config.js created with content paths
- [ ] PostCSS configured
- [ ] Tailwind directives added to index.css
- [ ] Can use Tailwind utilities in components

## Technical Notes
- Install: tailwindcss, postcss, autoprefixer
- Configure purge for production builds
- Test with a colored div

## Dependencies
- Blocked by: Task 1 (Initialize Vite Project)

## Estimate
XS (2 hours)
```

**Task 3: Set Up Folder Structure (XS)**
```markdown
## Description
Create project folder structure for components, hooks, types, lib.

## Acceptance Criteria
- [ ] /src/components/ui created
- [ ] /src/components/features created
- [ ] /src/hooks created
- [ ] /src/lib created
- [ ] /src/types created
- [ ] /src/stores created (if using Zustand)

## Technical Notes
Follow structure from Tech Spec section 9

## Dependencies
- Blocked by: Task 1

## Estimate
XS (1 hour)
```

**Task 4: Configure ESLint and Prettier (S)**
```markdown
## Description
Set up code linting and formatting tools.

## Acceptance Criteria
- [ ] ESLint installed and configured
- [ ] Prettier installed and configured
- [ ] .eslintrc.json created with React rules
- [ ] .prettierrc created
- [ ] npm run lint works
- [ ] Pre-commit hooks set up (optional)

## Technical Notes
- Use recommended React + TypeScript ESLint config
- Configure Prettier to work with Tailwind
- Add lint script to package.json

## Dependencies
- Blocked by: Task 1

## Estimate
S (4 hours)
```

### Example: "Data Layer" Feature Breakdown

**Task 1: Define TypeScript Types (S)**
```markdown
## Description
Create TypeScript interfaces for Goal, ProgressUpdate, and AppState.

## Context
- Related to: Tech Spec Section 4 (Data Models)
- User story: As a developer, I need type definitions to build type-safe components

## Acceptance Criteria
- [ ] Goal interface defined in /src/types/goal.ts
- [ ] ProgressUpdate interface defined
- [ ] AppState interface defined
- [ ] GoalCategory enum defined
- [ ] GoalStatus enum defined
- [ ] All fields properly typed with constraints documented

## Technical Notes
```typescript
interface Goal {
  id: string;
  title: string; // max 100 chars
  description?: string; // max 500 chars
  category: GoalCategory;
  targetDate?: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

## Dependencies
- None (can start immediately)

## Estimate
S (4 hours)

## Resources
- Tech Spec: [link to Data Models section]
```

**Task 2: Implement Storage Service (M)**
```markdown
## Description
Create a service for saving/loading data to/from localStorage with error handling.

## Context
- Related to: Tech Spec Section 7 (Storage Strategy)
- User story: As a user, I want my goals to persist so I don't lose them when I close the browser

## Acceptance Criteria
- [ ] StorageService class created in /src/lib/storage.ts
- [ ] saveGoals() method implemented
- [ ] loadGoals() method implemented
- [ ] saveUpdates() method implemented
- [ ] loadUpdates() method implemented
- [ ] Error handling for quota exceeded
- [ ] Data validation on load
- [ ] Fallback for corrupted data
- [ ] Unit tests (optional)

## Technical Notes
- Use namespace: 'ai-missions:goals'
- Handle JSON parse errors
- Validate data structure on load
- Return Result<T, E> type

## Dependencies
- Blocked by: Define TypeScript Types

## Estimate
M (8 hours)

## Resources
- Tech Spec: [link to Storage section]
```

**Task 3: Set Up Zustand Store (M)**
```markdown
## Description
Create Zustand store for global state management.

## Context
- Related to: Tech Spec Section 5 (State Management)
- User story: As a developer, I need centralized state to avoid prop drilling

## Acceptance Criteria
- [ ] Zustand installed
- [ ] goalStore created in /src/stores/goalStore.ts
- [ ] State shape matches AppState interface
- [ ] Actions implemented: addGoal, updateGoal, deleteGoal
- [ ] Actions implemented: addUpdate, selectGoal
- [ ] Persistence middleware configured
- [ ] DevTools integration (development only)

## Technical Notes
```typescript
const useGoalStore = create<GoalStore>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'goal-storage' }
    )
  )
);
```

## Dependencies
- Blocked by: Define TypeScript Types
- Blocked by: Implement Storage Service

## Estimate
M (8 hours)

## Resources
- Tech Spec: [link to State Management section]
- Zustand docs: https://github.com/pmndrs/zustand
```

## Step 6: Identify and Document Dependencies (30 minutes)

**For each task, identify:**
1. What must be completed before this can start?
2. What is blocked by this task?

**Use Linear's "Blocks" relationship:**
```javascript
// Task A blocks Task B
await linear.updateIssue({
  issueId: taskB.id,
  blockedById: taskA.id, // Linear will create relationship
});
```

### Dependency Types

**Technical dependencies:**
- Component B needs Component A to exist
- Feature needs data layer to be ready

**Sequential dependencies:**
- Setup must complete before features
- Foundation before core features

**Data dependencies:**
- Storage service needed before state management
- Types defined before implementation

**Design dependencies:**
- Wireframes needed before component implementation

### Example Dependency Map
```
Setup Tasks (Phase 0)
├── Initialize Project
├── Configure Tailwind (blocks: all UI tasks)
└── Set Up Folder Structure

Data Layer Tasks (Phase 1)
├── Define Types (blocks: all implementation)
├── Storage Service (blocked by: Types)
└── Zustand Store (blocked by: Types, Storage)

Feature Tasks (Phase 2)
├── Goal List Component (blocked by: Zustand, UI Components)
├── Goal Form (blocked by: Zustand, UI Components)
└── Progress Log (blocked by: Zustand, Goal Form)
```

## Step 7: Assign Priorities (20 minutes)

**Use P0-P3 labels:**

### P0: Critical (Must have for MVP, blocks others)
- Project setup tasks
- Core data models
- Essential UI components
- Critical user flows

### P1: High (Must have for MVP)
- Primary features
- Main user stories
- Basic error handling
- Core accessibility

### P2: Medium (Should have, not blocking)
- Secondary features
- Enhanced error handling
- Nice-to-have interactions
- Optimizations

### P3: Low (Nice to have, future)
- Advanced features
- Visual polish
- Performance optimizations
- Additional analytics

**Rule**: If everything is P0, nothing is P0. Be selective.

## Step 8: Add Estimates to All Tasks (20 minutes)

**Use T-shirt sizing:**
- XS: 2-3 hours
- S: 4-6 hours
- M: 1 day (8 hours)
- L: 2 days (16 hours)

**Add estimate to task description or custom field in Linear**

### Example
```markdown
## Estimate
M (8 hours)

## Breakdown
- Set up Zustand: 2 hours
- Implement actions: 3 hours
- Configure persistence: 2 hours
- Testing: 1 hour
```

## Step 9: Set Milestones (15 minutes)

**Create milestones for each phase:**

```javascript
const milestones = [
  {
    name: "Phase 0: Setup Complete",
    targetDate: "2026-01-12",
    description: "Project initialized, can start building features",
  },
  {
    name: "Phase 1: Foundation Complete",
    targetDate: "2026-01-13",
    description: "Data layer and base components ready",
  },
  {
    name: "Phase 2: Core Features Complete",
    targetDate: "2026-01-15",
    description: "MVP features implemented",
  },
  {
    name: "Phase 3: Production Ready",
    targetDate: "2026-01-17",
    description: "Polished, tested, deployed",
  },
];
```

**Link tasks to appropriate milestone**

## Step 10: Create All Tickets in Linear (30 minutes)

**Use Linear MCP to batch create:**

```javascript
// Example script to create all tasks
const tasks = [
  {
    title: "Initialize Vite Project",
    description: "...", // Full description from template
    featureId: setupFeature.id,
    estimate: "XS",
    priority: 0,
    labels: ["task", "setup", "p0-critical"],
  },
  // ... more tasks
];

for (const task of tasks) {
  await linear.createIssue({
    title: task.title,
    description: task.description,
    teamId: "team-id",
    projectId: "project-id",
    parentId: task.featureId,
    labelIds: task.labels,
    priority: task.priority,
    estimate: task.estimate,
  });
}
```

**For each task:**
- Clear title (action-oriented)
- Full description using template
- Proper parent (feature)
- Correct labels
- Priority set
- Estimate added
- Dependencies linked

## Step 11: Validate Breakdown (20 minutes)

**Review checklist:**
- [ ] All spec requirements covered by tickets
- [ ] Each ticket is actionable and specific
- [ ] All tickets have acceptance criteria
- [ ] Dependencies are documented and linked
- [ ] Priorities are realistic (not everything P0)
- [ ] Estimates are reasonable
- [ ] Milestones are achievable
- [ ] Critical path identified
- [ ] No tickets > 2 days (L size max)
- [ ] Setup phase can complete quickly (< 1 day)

**Validation questions:**
- Can each ticket be completed independently (once unblocked)?
- Are acceptance criteria testable?
- Is the critical path clear?
- Can multiple tickets be worked in parallel?
- Does the sequence make sense?

## Step 12: Share with Team (15 minutes)

**Review with PM:**
- Does this breakdown cover all PRD requirements?
- Are priorities aligned with user value?
- Any missing scope?

**Review with Tech Lead:**
- Are dependencies correct?
- Are estimates reasonable?
- Is the technical sequence sound?
- Any missing technical tasks?

**Review with Designer:**
- Are design dependencies clear?
- Is UI implementation sequenced correctly?
- Any missing design tasks?

**Iterate based on feedback**

## Quality Checklist
Before considering breakdown complete:
- [ ] Epic created and linked to specs
- [ ] Features created (3-7) and linked to Epic
- [ ] Tasks created (10-30) and linked to Features
- [ ] All tasks follow template structure
- [ ] Dependencies mapped and linked in Linear
- [ ] Priorities assigned (P0-P3)
- [ ] Estimates provided (XS/S/M/L)
- [ ] Milestones defined with target dates
- [ ] Critical path identified
- [ ] Team has reviewed and aligned
- [ ] All tasks link back to specs

## Common Pitfalls to Avoid
- ❌ Tasks too large (> 2 days)
- ❌ Vague descriptions ("Improve UI")
- ❌ Missing acceptance criteria
- ❌ Undocumented dependencies
- ❌ Everything marked P0
- ❌ Unrealistic estimates
- ❌ No clear phases/milestones
- ❌ Tasks don't link to specs

## Tips for Great Breakdowns
- ✅ Each task delivers value independently
- ✅ Acceptance criteria are specific and testable
- ✅ Dependencies are explicit
- ✅ Priorities reflect true urgency
- ✅ Estimates include buffer
- ✅ Critical path is obvious
- ✅ Parallel work streams identified
- ✅ Setup phase is minimal

## Remember
Your breakdown enables the team to execute with confidence. Make dependencies visible, priorities clear, and scope manageable. The best breakdown is one where the team can self-organize around the tickets without constant clarification.  