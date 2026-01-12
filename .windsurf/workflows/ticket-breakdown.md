---
auto_execution_mode: 1
---
# Ticket Breakdown Workflow

This workflow guides the TPM through breaking down a mission into executable Linear tickets.

## Prerequisites
- Approved PRD document
- Approved Technical Specification
- Approved UI Specification (if applicable)
- Access to Linear workspace
- Understanding of team capacity and timeline

## Step 1: Review All Specifications (30 minutes)
**Read the PRD:**
- What are the must-have features?
- What are the success criteria?
- What's the timeline/deadline?
- What's explicitly out of scope?

**Read the Technical Specification:**
- What's the component structure?
- What's the data model?
- What are the technical dependencies?
- What are the estimates?

**Read the UI Specification:**
- What are the screens/views?
- What are the interactions?
- What are the design dependencies?

**Identify dependencies:**
- What must be built first?
- What can be built in parallel?
- What are the external dependencies?

## Step 2: Define Work Phases (20 minutes)
**Break work into logical phases:**

**Phase 1: Foundation (Setup & Core Infrastructure)**
- Project setup and configuration
- Data model implementation
- Core utilities and helpers
- State management setup

**Phase 2: Core Features (MVP Functionality)**
- Primary user flows
- Essential components
- Data persistence
- Basic styling

**Phase 3: Polish & Enhancement (UX Refinement)**
- Responsive design
- Animations and transitions
- Error handling
- Loading states

**Phase 4: Quality & Deployment (Testing & Launch)**
- Testing and bug fixes
- Accessibility improvements
- Performance optimization
- Deployment and documentation

**Assign rough timeline to each phase:**
- Phase 1: X hours
- Phase 2: Y hours
- Phase 3: Z hours
- Phase 4: W hours

## Step 3: Create Foundation Tickets (30 minutes)
**Setup & Configuration tickets:**

```markdown
TICKET: Project Setup & Configuration
Type: Task
Priority: Urgent
Estimate: 1-2 hours
Labels: setup, foundation

Description:
Initialize the project with the standard tech stack.

Acceptance Criteria:
- [ ] Vite + React + TypeScript project created
- [ ] Tailwind CSS configured
- [ ] ESLint + Prettier configured
- [ ] Git repository initialized
- [ ] README with setup instructions
- [ ] Dev server runs without errors
- [ ] Basic folder structure created (/src/components, /src/hooks, /src/utils, etc.)

Dependencies: None
```

```markdown
TICKET: Data Model Implementation
Type: Task
Priority: High
Estimate: 2-3 hours
Labels: foundation, data-model

Description:
Implement TypeScript interfaces and types for all data entities as defined in the technical specification.

Acceptance Criteria:
- [ ] All entity interfaces defined (e.g., Resolution, ProgressUpdate)
- [ ] Validation schemas created (using Zod)
- [ ] Type guards implemented
- [ ] Default values defined
- [ ] Types exported from central location
- [ ] JSDoc comments for complex types

Technical Notes:
[Reference specific sections of tech spec]

Dependencies: Project Setup
```

```markdown
TICKET: Storage Service Implementation
Type: Task
Priority: High
Estimate: 3-4 hours
Labels: foundation, data-layer

Description:
Implement data persistence layer (localStorage/Supabase/Firebase as per tech spec).

Acceptance Criteria:
- [ ] Storage service class/module created
- [ ] CRUD operations for all entities
- [ ] Error handling for storage failures
- [ ] Data migration strategy (if applicable)
- [ ] Storage quota monitoring (if localStorage)
- [ ] Unit tests for storage operations

Technical Notes:
[Reference storage solution from tech spec]

Dependencies: Data Model Implementation
```

```markdown
TICKET: State Management Setup
Type: Task
Priority: High
Estimate: 2-3 hours
Labels: foundation, state-management

Description:
Set up global state management (Context API/Zustand as per tech spec).

Acceptance Criteria:
- [ ] State store created with defined structure
- [ ] Actions/reducers implemented
- [ ] Hooks for accessing state created
- [ ] State persistence integrated with storage service
- [ ] DevTools configured (if applicable)
- [ ] Initial state loading implemented

Technical Notes:
[Reference state management approach from tech spec]

Dependencies: Storage Service Implementation
```

## Step 4: Create Core Feature Tickets (45 minutes)
**For each major feature, create tickets following this pattern:**

```markdown
TICKET: [Feature Name] - Component Implementation
Type: Feature
Priority: High/Medium
Estimate: X hours
Labels: feature, component, [feature-name]

Description:
Implement [feature description] as defined in PRD FR-[number].

User Story:
As a [user type], I want [goal], so that [benefit].

Acceptance Criteria:
- [ ] Component renders correctly with all required props
- [ ] All user interactions work as expected
- [ ] Form validation implemented (if applicable)
- [ ] Error states handled gracefully
- [ ] Loading states displayed appropriately
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Accessibility requirements met (keyboard nav, ARIA labels)
- [ ] Unit tests written and passing

Design Reference:
[Link to design mockups or UI spec section]

Technical Notes:
[Reference component structure from tech spec]

Dependencies: [List dependent tickets]
```

**Example feature breakdown:**

```markdown
TICKET: Create Resolution - UI Component
Type: Feature
Priority: High
Estimate: 3-4 hours
Labels: feature, component, create-resolution

Description:
Implement the Create Resolution form component allowing users to add new resolutions.

User Story:
As a goal-setter, I want to create a new resolution with title, description, category, and target date, so that I can start tracking my progress.

Acceptance Criteria:
- [ ] Form with fields: title (required), description (optional), category (dropdown), target date (date picker)
- [ ] Real-time validation with error messages
- [ ] Submit button disabled until form is valid
- [ ] Success message after creation
- [ ] Form resets after successful submission
- [ ] Cancel button returns to previous view
- [ ] Mobile-responsive layout
- [ ] Keyboard navigation works
- [ ] Screen reader accessible

Design Reference:
[Link to UI spec section]

Technical Notes:
- Use React Hook Form + Zod for validation
- Category options: ['Health', 'Career', 'Personal', 'Financial', 'Relationships']
- Target date must be future date

Dependencies: 
- Data Model Implementation
- State Management Setup
- Form Components (Button, Input, Select, DatePicker)
```

```markdown
TICKET: Resolution List - Display Component
Type: Feature
Priority: High
Estimate: 3-4 hours
Labels: feature, component, resolution-list

Description:
Implement the resolution list view showing all user resolutions.

User Story:
As a user, I want to see all my resolutions in one place, so that I can quickly review my goals.

Acceptance Criteria:
- [ ] Displays all resolutions in card format
- [ ] Shows key info: title, category, target date, status
- [ ] Empty state when no resolutions exist
- [ ] Filter by status (active/completed/abandoned)
- [ ] Sort options (date created, target date, alphabetical)
- [ ] Click card to view details
- [ ] Quick actions: edit, delete (with confirmation)
- [ ] Responsive grid layout
- [ ] Loading skeleton while data loads

Design Reference:
[Link to UI spec section]

Technical Notes:
- Use CSS Grid for responsive layout
- Implement optimistic UI updates for delete
- Consider virtualization if >100 items

Dependencies:
- Data Model Implementation
- State Management Setup
- ResolutionCard component
```

## Step 5: Create Shared Component Tickets (30 minutes)
**Identify reusable components needed across features:**

```markdown
TICKET: Shared UI Components - Button
Type: Task
Priority: High
Estimate: 1-2 hours
Labels: component, shared, ui

Description:
Create reusable Button component with variants.

Acceptance Criteria:
- [ ] Variants: primary, secondary, danger, ghost
- [ ] Sizes: sm, md, lg
- [ ] States: default, hover, active, disabled, loading
- [ ] Icon support (left/right)
- [ ] Full width option
- [ ] Accessible (ARIA attributes, keyboard support)
- [ ] TypeScript props interface
- [ ] Storybook stories (if using Storybook)

Technical Notes:
- Use Tailwind for styling
- Support both button and link (as="a") usage
- Loading state shows spinner

Dependencies: Project Setup
```

**Create tickets for all shared components:**
- Button
- Input
- Select/Dropdown
- DatePicker
- Modal/Dialog
- Card
- LoadingSpinner
- Toast/Notification
- ConfirmDialog

## Step 6: Create Polish & Enhancement Tickets (20 minutes)
**Responsive Design:**

```markdown
TICKET: Mobile Responsiveness - All Views
Type: Enhancement
Priority: Medium
Estimate: 3-4 hours
Labels: enhancement, responsive, mobile

Description:
Ensure all views are fully responsive and work well on mobile devices (320px+).

Acceptance Criteria:
- [ ] All views tested on mobile (320px, 375px, 414px)
- [ ] All views tested on tablet (768px, 1024px)
- [ ] Touch targets minimum 44x44px
- [ ] No horizontal scrolling
- [ ] Navigation adapted for mobile
- [ ] Forms usable on mobile
- [ ] Modals/dialogs work on small screens
- [ ] Text remains readable at all sizes

Testing Checklist:
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13 (390px)
- [ ] iPad (768px)
- [ ] Desktop (1440px+)

Dependencies: All core feature tickets
```

**Animations & Transitions:**

```markdown
TICKET: Animations & Micro-interactions
Type: Enhancement
Priority: Low
Estimate: 2-3 hours
Labels: enhancement, animations, ux

Description:
Add smooth transitions and micro-interactions to improve UX.

Acceptance Criteria:
- [ ] Page transitions smooth (if multi-page)
- [ ] Modal open/close animations
- [ ] Button hover/active states
- [ ] Form field focus states
- [ ] List item hover effects
- [ ] Loading state animations
- [ ] Success/error feedback animations
- [ ] All animations 60fps
- [ ] Respect prefers-reduced-motion

Technical Notes:
- Use Tailwind transition utilities
- Consider Framer Motion for complex animations
- Keep animations subtle and purposeful

Dependencies: All core feature tickets
```

**Error Handling:**

```markdown
TICKET: Global Error Handling & User Feedback
Type: Enhancement
Priority: Medium
Estimate: 2-3 hours
Labels: enhancement, error-handling, ux

Description:
Implement comprehensive error handling and user feedback system.

Acceptance Criteria:
- [ ] Error boundary for React errors
- [ ] Toast notifications for user actions
- [ ] Form validation errors displayed inline
- [ ] Network error handling with retry
- [ ] Storage quota error handling
- [ ] 404 page (if multi-page app)
- [ ] Offline detection and messaging
- [ ] Error logging (console in dev)

Technical Notes:
- Use react-hot-toast or similar for notifications
- Provide actionable error messages
- Log errors for debugging

Dependencies: All core feature tickets
```

## Step 7: Create Quality & Deployment Tickets (20 minutes)
**Testing:**

```markdown
TICKET: Unit & Component Tests
Type: Task
Priority: Medium
Estimate: 4-6 hours
Labels: testing, quality

Description:
Write unit and component tests for core functionality.

Acceptance Criteria:
- [ ] Utility functions tested
- [ ] Custom hooks tested
- [ ] Storage service tested
- [ ] State management tested
- [ ] Core components tested
- [ ] User interactions tested
- [ ] Test coverage >70%
- [ ] All tests passing in CI

Technical Notes:
- Use Vitest + React Testing Library
- Focus on critical paths first
- Mock external dependencies

Dependencies: All core feature tickets
```

**Accessibility:**

```markdown
TICKET: Accessibility Audit & Improvements
Type: Task
Priority: High
Estimate: 3-4 hours
Labels: accessibility, quality, a11y

Description:
Audit and improve accessibility to meet WCAG 2.1 AA standards.

Acceptance Criteria:
- [ ] Lighthouse accessibility score >95
- [ ] Keyboard navigation works everywhere
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] Color contrast ratios meet AA standards
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] Focus indicators visible
- [ ] ARIA attributes used correctly
- [ ] Skip links for navigation
- [ ] No accessibility errors in axe DevTools

Testing Checklist:
- [ ] Tab through entire app
- [ ] Test with screen reader
- [ ] Test with keyboard only
- [ ] Run axe DevTools audit

Dependencies: All core feature tickets
```

**Performance:**

```markdown
TICKET: Performance Optimization
Type: Task
Priority: Medium
Estimate: 2-3 hours
Labels: performance, quality

Description:
Optimize app performance to meet targets from tech spec.

Acceptance Criteria:
- [ ] Lighthouse performance score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Bundle size <500KB (initial)
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading for routes/components
- [ ] No unnecessary re-renders

Technical Notes:
- Use React DevTools Profiler
- Analyze bundle with vite-bundle-visualizer
- Implement React.memo where beneficial

Dependencies: All core feature tickets
```

**Deployment:**

```markdown
TICKET: Deployment to Vercel
Type: Task
Priority: High
Estimate: 1-2 hours
Labels: deployment, devops

Description:
Deploy application to Vercel and verify production build.

Acceptance Criteria:
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Production build successful
- [ ] App accessible via public URL
- [ ] All features work in production
- [ ] No console errors in production
- [ ] Analytics configured (if applicable)
- [ ] Custom domain configured (if applicable)

Technical Notes:
- Use Vercel CLI or GitHub integration
- Test production build locally first
- Document deployment process in README

Dependencies: All quality tickets
```

## Step 8: Create Documentation Tickets (15 minutes)

```markdown
TICKET: Project Documentation
Type: Task
Priority: Medium
Estimate: 1-2 hours
Labels: documentation

Description:
Create comprehensive project documentation.

Acceptance Criteria:
- [ ] README with setup instructions
- [ ] Architecture documentation
- [ ] Component documentation
- [ ] API/data layer documentation
- [ ] Deployment instructions
- [ ] Troubleshooting guide
- [ ] Contributing guidelines (if open source)

Dependencies: Deployment to Vercel
```

## Step 9: Organize Tickets in Linear (30 minutes)
**Create tickets in Linear:**
1. Create all tickets in the Epic
2. Set appropriate priority (Urgent/High/Medium/Low)
3. Add estimates (use Linear's estimate field)
4. Add labels for categorization
5. Set dependencies (blocks/blocked by)
6. Assign to team members (if applicable)

**Set up project views:**
- **Kanban board**: Backlog → Todo → In Progress → In Review → Done
- **Timeline view**: Visualize dependencies and phases
- **Priority view**: Focus on urgent/high priority items

**Create milestones:**
- Milestone 1: Foundation Complete
- Milestone 2: Core Features Complete
- Milestone 3: Polish Complete
- Milestone 4: Deployed to Production

## Step 10: Create Ticket Dependencies (20 minutes)
**Map dependencies in Linear:**
- Foundation tickets → Core feature tickets
- Shared components → Feature tickets that use them
- Core features → Polish tickets
- All features → Quality tickets
- Quality tickets → Deployment ticket

**Identify critical path:**
- What's the minimum set of tickets to get to MVP?
- What's the longest dependency chain?
- Where are the bottlenecks?

**Example dependency chain:**
```
Project Setup
  → Data Model
    → Storage Service
      → State Management
        → Shared Components
          → Core Features
            → Polish
              → Quality
                → Deployment
```

## Step 11: Estimate Timeline (20 minutes)
**Calculate total effort:**
- Sum all ticket estimates
- Add 20-30% buffer for unknowns
- Consider parallel work opportunities

**Create timeline:**
- Week 1, Day 1-2: Foundation
- Week 1, Day 3-5: Core Features (parallel work)
- Week 2, Day 1-2: Polish & Enhancement
- Week 2, Day 3-4: Quality & Testing
- Week 2, Day 5: Deployment & Documentation

**Identify risks to timeline:**
- Technical unknowns
- Dependency bottlenecks
- External dependencies
- Scope creep potential

## Step 12: Review with Team (30 minutes)
**Share breakdown with PM:**
- Does this cover all PRD requirements?
- Is the timeline realistic?
- Are priorities aligned?
- Any missing tickets?

**Share breakdown with Tech Lead:**
- Are estimates reasonable?
- Are dependencies correct?
- Any technical risks?
- Any missing technical tasks?

**Share breakdown with Designer:**
- Are design dependencies clear?
- Is implementation order logical?
- Any design blockers?

**Iterate based on feedback:**
- Adjust priorities
- Add missing tickets
- Update estimates
- Clarify dependencies

## Step 13: Kickoff Meeting (30 minutes)
**Present breakdown to team:**
- Overview of phases
- Timeline and milestones
- Critical path
- Dependencies
- Risks and mitigations

**Assign initial tickets:**
- Start with foundation tickets
- Assign based on expertise
- Ensure no blockers

**Set up communication:**
- Daily standups (if applicable)
- Progress tracking in Linear
- Blocker escalation process
- Definition of done

## Quality Checklist
Before starting implementation:
- [ ] All PRD requirements have corresponding tickets
- [ ] All technical tasks from tech spec are covered
- [ ] Shared components identified and ticketed
- [ ] Dependencies mapped correctly
- [ ] Estimates provided for all tickets
- [ ] Priorities assigned appropriately
- [ ] Labels and metadata added
- [ ] Milestones created
- [ ] Timeline is realistic
- [ ] Team has reviewed and approved
- [ ] Kickoff meeting completed

## Common Pitfalls to Avoid
- ❌ Tickets too large: Break down into <8 hour chunks
- ❌ Vague acceptance criteria: Be specific and testable
- ❌ Missing dependencies: Map all relationships
- ❌ No buffer time: Always add 20-30% buffer
- ❌ Ignoring technical debt: Include refactoring tickets
- ❌ No testing tickets: Quality is not optional
- ❌ Unclear priorities: Everything can't be P0
- ❌ No documentation: Include doc tickets

## Tips for Great Ticket Breakdowns
- ✅ Each ticket should be completable in <1 day
- ✅ Acceptance criteria should be testable
- ✅ Include technical notes and references
- ✅ Link to relevant specs and designs
- ✅ Make dependencies explicit
- ✅ Group related tickets with labels
- ✅ Prioritize ruthlessly
- ✅ Include buffer for unknowns
- ✅ Think about parallel work opportunities
- ✅ Consider team skills and capacity

## Output
A complete set of Linear tickets that enables:
- Clear understanding of all work required
- Logical sequencing of implementation
- Accurate timeline estimation
- Efficient parallel work
- Easy progress tracking
- Successful mission completion
