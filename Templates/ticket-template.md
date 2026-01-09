# Ticket Template

Use this template when creating tickets in Linear for implementation tasks.

---

## Ticket Title Format

**Format:** `[Type] [Feature/Component Name] - [Specific Action]`

**Examples:**
- `Setup: Initialize Vite Project with React + TypeScript`
- `Feature: Goal Creation Form`
- `Component: Reusable Button with Variants`
- `Bug: Fix date picker validation`
- `Enhancement: Add loading skeleton to goal list`
- `Refactor: Extract storage logic into service`

---

## Ticket Description Template

```markdown
## Description
[Clear, concise description of what needs to be built or fixed. 1-3 sentences.]

## Context
[Why this ticket exists. Link to related specs, user stories, or other tickets.]
- Related to: [PRD Section / Tech Spec Section / UI Spec Screen]
- User story: As a [user type], I want [goal], so that [benefit]
- Parent feature: [Link to parent feature ticket]

## Acceptance Criteria
[Specific, testable criteria that define when this ticket is complete. Use checkboxes.]
- [ ] [Criterion 1: Specific and measurable]
- [ ] [Criterion 2: Specific and measurable]
- [ ] [Criterion 3: Specific and measurable]
- [ ] [Criterion 4: Specific and measurable]
- [ ] [Criterion 5: Specific and measurable]

## Technical Notes
[Implementation details, code examples, or technical constraints]
- [Note 1: e.g., Use React Hook Form for form management]
- [Note 2: e.g., Validate with Zod schema]
- [Note 3: e.g., Follow component structure from tech spec]

[Optional: Code example or pseudocode]
```typescript
// Example implementation approach
[code snippet]
```

## Design Reference
[Link to design mockups, UI spec section, or Figma file]
- Figma: [Link]
- UI Spec: [Section reference]
- Screenshots: [Attach if applicable]

## Dependencies
[What must be completed before this can start]
- Blocked by: [Ticket ID/Name]
- Blocks: [Ticket ID/Name]
- Related to: [Ticket ID/Name]

## Testing Requirements
[How to test this ticket]
- [ ] Unit tests written and passing
- [ ] Component tests written and passing
- [ ] Manual testing completed
- [ ] Tested on mobile/tablet/desktop
- [ ] Tested with keyboard navigation
- [ ] Tested with screen reader

## Estimate
[T-shirt size or hours]
- Size: XS | S | M | L
- Hours: [X hours]
- Confidence: High | Medium | Low

## Resources
[Links to documentation, examples, or references]
- [Resource 1]
- [Resource 2]
```

---

## Example Tickets

### Example 1: Setup Task

```markdown
## Ticket: Setup - Initialize Vite Project with React + TypeScript

### Description
Initialize a new Vite project with React 18 and TypeScript template as the foundation for the mission.

### Context
- Related to: Tech Spec Section 2 (Architecture Overview)
- This is the first task in Phase 0: Setup
- Enables all subsequent development work

### Acceptance Criteria
- [ ] Project created using `npm create vite@latest`
- [ ] React 18+ and TypeScript configured
- [ ] Dev server starts successfully with `npm run dev`
- [ ] TypeScript compiles with no errors (strict mode enabled)
- [ ] Can render a "Hello World" component
- [ ] Git repository initialized with .gitignore
- [ ] README.md created with setup instructions

### Technical Notes
- Use Vite 5.x
- Enable TypeScript strict mode in tsconfig.json
- Use React 18+ for concurrent features
- Configure path aliases (@ for src/)

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Design Reference
N/A (Setup task)

### Dependencies
- Blocked by: None (first task)
- Blocks: All subsequent tasks

### Testing Requirements
- [ ] Dev server runs without errors
- [ ] TypeScript compilation succeeds
- [ ] Can build for production (`npm run build`)

### Estimate
- Size: XS
- Hours: 2 hours
- Confidence: High

### Resources
- Vite docs: https://vitejs.dev/guide/
- React docs: https://react.dev/
```

---

### Example 2: Data Model Task

```markdown
## Ticket: Foundation - Define TypeScript Types for Goal & ProgressUpdate

### Description
Create TypeScript interfaces and Zod validation schemas for Goal and ProgressUpdate entities as defined in the technical specification.

### Context
- Related to: Tech Spec Section 3 (Data Model)
- User story: As a developer, I need type definitions to build type-safe components
- Parent feature: Data Layer Foundation

### Acceptance Criteria
- [ ] Goal interface defined in `/src/types/goal.ts`
- [ ] ProgressUpdate interface defined in `/src/types/progress.ts`
- [ ] GoalCategory enum defined ('Health', 'Career', 'Personal', 'Financial', 'Relationships')
- [ ] GoalStatus enum defined ('active', 'completed', 'abandoned')
- [ ] Zod schemas created for runtime validation
- [ ] Type guards implemented (isGoal, isProgressUpdate)
- [ ] JSDoc comments for all types
- [ ] All types exported from `/src/types/index.ts`

### Technical Notes
```typescript
// /src/types/goal.ts
export interface Goal {
  id: string;              // UUID
  title: string;           // Required, 1-100 chars
  description?: string;    // Optional, max 500 chars
  category: GoalCategory;  // Required
  targetDate?: Date;       // Optional, future date
  status: GoalStatus;      // Required
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated
}

export enum GoalCategory {
  Health = 'Health',
  Career = 'Career',
  Personal = 'Personal',
  Financial = 'Financial',
  Relationships = 'Relationships',
}

export enum GoalStatus {
  Active = 'active',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

// Zod schema for validation
export const goalSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.nativeEnum(GoalCategory),
  targetDate: z.date().optional(),
  status: z.nativeEnum(GoalStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### Design Reference
N/A (Data model task)

### Dependencies
- Blocked by: Project Setup
- Blocks: Storage Service, State Management, All Components

### Testing Requirements
- [ ] Type guards work correctly
- [ ] Zod validation catches invalid data
- [ ] All types compile without errors

### Estimate
- Size: S
- Hours: 4 hours
- Confidence: High

### Resources
- Tech Spec: Section 3 (Data Model)
- Zod docs: https://zod.dev/
```

---

### Example 3: Component Task

```markdown
## Ticket: Component - Reusable Button with Variants

### Description
Create a reusable Button component with multiple variants (primary, secondary, danger, ghost) and sizes (sm, md, lg) following the design system.

### Context
- Related to: UI Spec Section 3 (Component Library - Button)
- User story: As a developer, I need a consistent button component to use across the app
- Parent feature: UI Components Foundation

### Acceptance Criteria
- [ ] Button component created in `/src/components/ui/Button.tsx`
- [ ] Variants implemented: primary, secondary, danger, ghost
- [ ] Sizes implemented: sm, md, lg
- [ ] States handled: default, hover, active, disabled, loading
- [ ] Icon support (left/right positioning)
- [ ] Full width option available
- [ ] Accessible (ARIA attributes, keyboard support)
- [ ] TypeScript props interface defined
- [ ] Loading state shows spinner
- [ ] Can render as button or link (polymorphic)

### Technical Notes
```typescript
// Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'button' | 'a';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}) => {
  // Implementation
};
```

Use Tailwind CSS for styling with class variance authority (cva) for variant management.

### Design Reference
- UI Spec: Section 3 (Component Library - Button)
- Figma: [Link to button component]

### Dependencies
- Blocked by: Project Setup, Tailwind Configuration
- Blocks: All feature components that use buttons

### Testing Requirements
- [ ] Component renders all variants correctly
- [ ] All sizes render correctly
- [ ] Disabled state prevents clicks
- [ ] Loading state shows spinner and disables button
- [ ] Icons render in correct positions
- [ ] Keyboard navigation works (Enter, Space)
- [ ] Screen reader announces button correctly
- [ ] Component tests written and passing

### Estimate
- Size: S
- Hours: 4 hours
- Confidence: High

### Resources
- UI Spec: Section 3
- Tailwind docs: https://tailwindcss.com/
- CVA: https://cva.style/
```

---

### Example 4: Feature Task

```markdown
## Ticket: Feature - Goal Creation Form

### Description
Implement the goal creation form allowing users to create new goals with title, description, category, and target date.

### Context
- Related to: PRD FR-1 (Create Goal), Tech Spec Section 4, UI Spec Screen 2
- User story: As a user, I want to create a new goal with details, so that I can start tracking my progress
- Parent feature: Goal Management

### Acceptance Criteria
- [ ] Form component created in `/src/components/features/GoalForm.tsx`
- [ ] Form fields: title (required), description (optional), category (dropdown), target date (date picker)
- [ ] Real-time validation with error messages
- [ ] Submit button disabled until form is valid
- [ ] Success toast notification after creation
- [ ] Form resets after successful submission
- [ ] Cancel button returns to previous view
- [ ] Mobile-responsive layout
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader accessible with proper labels
- [ ] Goal saved to state and persisted to storage

### Technical Notes
- Use React Hook Form for form management
- Use Zod schema for validation (from types)
- Category dropdown options from GoalCategory enum
- Target date must be future date (validate in schema)
- Generate UUID for new goal ID
- Set createdAt and updatedAt to current timestamp
- Call `addGoal` action from Zustand store

```typescript
const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.nativeEnum(GoalCategory, { required_error: 'Category is required' }),
  targetDate: z.date().min(new Date(), 'Target date must be in the future').optional(),
});
```

### Design Reference
- UI Spec: Screen 2 (Create Goal Screen)
- Figma: [Link to create goal form]

### Dependencies
- Blocked by: 
  - TypeScript Types
  - Zustand Store
  - Button Component
  - Input Component
  - Select Component
  - DatePicker Component
- Blocks: Edit Goal Form

### Testing Requirements
- [ ] Form validation works for all fields
- [ ] Can submit valid form successfully
- [ ] Cannot submit invalid form
- [ ] Error messages display correctly
- [ ] Success toast appears after submission
- [ ] Form resets after submission
- [ ] Cancel button works
- [ ] Tested on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces errors
- [ ] Component tests written and passing

### Estimate
- Size: M
- Hours: 8 hours
- Confidence: Medium

### Resources
- PRD: FR-1
- Tech Spec: Section 4
- UI Spec: Screen 2
- React Hook Form: https://react-hook-form.com/
```

---

### Example 5: Bug Fix Task

```markdown
## Ticket: Bug - Date Picker Allows Past Dates for Goal Target

### Description
The date picker in the goal creation form currently allows users to select past dates for the target date, which should only allow future dates.

### Context
- Related to: Goal Creation Form (Ticket #123)
- Bug report: Users can create goals with past target dates
- Impact: Medium - Doesn't break functionality but creates confusing UX

### Acceptance Criteria
- [ ] Date picker minimum date set to today
- [ ] Past dates are disabled/grayed out
- [ ] Validation error shows if user somehow submits past date
- [ ] Error message is clear: "Target date must be in the future"
- [ ] Existing goals with past dates are not affected
- [ ] Works correctly across timezones

### Technical Notes
```typescript
// In GoalForm.tsx
const formSchema = z.object({
  // ...
  targetDate: z.date()
    .min(new Date(), 'Target date must be in the future')
    .optional(),
});

// In DatePicker component
<DatePicker
  minDate={new Date()}
  // ...
/>
```

### Design Reference
- UI Spec: Screen 2 (Create Goal Screen)

### Dependencies
- None (bug fix on existing feature)

### Testing Requirements
- [ ] Cannot select past dates in date picker
- [ ] Validation error shows for past dates
- [ ] Can select today and future dates
- [ ] Existing goals with past dates still display correctly
- [ ] Manual testing on mobile/desktop
- [ ] Regression test added

### Estimate
- Size: XS
- Hours: 2 hours
- Confidence: High

### Resources
- Original ticket: #123
- Date picker docs: [Link]
```

---

## Ticket Sizing Guidelines

### XS (2-3 hours)
- Simple configuration changes
- Small UI tweaks
- Basic component creation
- Documentation updates

### S (4-6 hours)
- Standard component implementation
- Simple integrations
- Basic feature additions
- Straightforward bug fixes

### M (1 day / 8 hours)
- Complex components
- Feature implementations
- Multiple component integration
- Significant refactoring

### L (2 days / 16 hours)
- Major features
- Full user flows
- Complex integrations
- Large refactoring efforts

**If larger than L:** Break down into smaller tickets

---

## Labels to Use

### Type Labels
- `setup` - Project setup and configuration
- `feature` - New feature implementation
- `component` - UI component creation
- `bug` - Bug fix
- `enhancement` - Improvement to existing feature
- `refactor` - Code refactoring
- `docs` - Documentation
- `test` - Testing tasks

### Priority Labels
- `p0-critical` - Blocks all other work
- `p1-high` - Must have for MVP
- `p2-medium` - Should have
- `p3-low` - Nice to have

### Phase Labels
- `phase-0-setup` - Setup phase
- `phase-1-foundation` - Foundation phase
- `phase-2-features` - Core features phase
- `phase-3-polish` - Polish phase
- `phase-4-deploy` - Deployment phase

### Area Labels
- `frontend` - Frontend work
- `backend` - Backend work
- `design` - Design work
- `accessibility` - Accessibility improvements
- `performance` - Performance optimization

---

## Best Practices

### Writing Good Tickets
- ✅ Be specific and actionable
- ✅ Include clear acceptance criteria
- ✅ Link to relevant specs and resources
- ✅ Estimate realistically
- ✅ Document dependencies
- ✅ Make it testable

### Avoid
- ❌ Vague descriptions ("Improve UI")
- ❌ Missing acceptance criteria
- ❌ No context or links
- ❌ Unrealistic estimates
- ❌ Tickets larger than 2 days
- ❌ Combining unrelated work

---

## Checklist Before Creating Ticket

- [ ] Title is clear and action-oriented
- [ ] Description explains what and why
- [ ] Acceptance criteria are specific and testable
- [ ] Technical notes provide implementation guidance
- [ ] Dependencies are documented
- [ ] Estimate is provided
- [ ] Labels are added
- [ ] Links to specs/resources included
- [ ] Testing requirements defined
