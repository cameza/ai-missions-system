---
auto_execution_mode: 1
---
# Technical Design Workflow

This workflow guides the Tech Lead through creating a comprehensive technical specification based on the PRD.

## Prerequisites
- Approved PRD document
- Understanding of tech stack (React, TypeScript, Vite, Tailwind)
- Access to Linear Epic
- Familiarity with deployment target (Vercel)

## Step 1: Review PRD (20 minutes)
**Read the PRD thoroughly:**
- What's the core functionality?
- What are the functional requirements?
- What are the non-functional requirements?
- What are the constraints and assumptions?
- What's explicitly out of scope?

**Extract technical implications:**
- Data model: What entities and relationships exist?
- State management: What state needs to be managed?
- API needs: Do we need backend endpoints?
- External services: What third-party integrations?
- Performance requirements: What are the targets?

## Step 2: Define Architecture (45 minutes)
**Choose architectural pattern:**
- Component-based architecture (React)
- State management approach (Context API / Zustand)
- Data flow pattern (unidirectional)
- Routing strategy (if multi-page)

**Define system layers:**
```
┌─────────────────────────────────────┐
│         UI Components               │
│  (Presentational + Container)       │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│      State Management Layer         │
│    (Context / Zustand / Hooks)      │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│       Data Access Layer             │
│  (API calls / localStorage / DB)    │
└─────────────────────────────────────┘
           ↕
┌─────────────────────────────────────┐
│      External Services              │
│  (Supabase / Firebase / APIs)       │
└─────────────────────────────────────┘
```

**Document key architectural decisions:**
- Why this approach?
- What alternatives were considered?
- What are the trade-offs?

## Step 3: Design Data Model (30 minutes)
**Define all entities:**
For each entity, specify:
- Entity name
- Properties (with types)
- Relationships to other entities
- Validation rules
- Default values

**Example:**
```typescript
interface Resolution {
  id: string;              // UUID
  title: string;           // Required, 1-100 chars
  description?: string;    // Optional, max 500 chars
  category: string;        // Required, from predefined list
  targetDate: Date;        // Required, future date
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;         // Auto-generated
  updatedAt: Date;         // Auto-updated
}

interface ProgressUpdate {
  id: string;              // UUID
  resolutionId: string;    // Foreign key to Resolution
  content: string;         // Required, 1-1000 chars
  timestamp: Date;         // Auto-generated
  mood?: 'positive' | 'neutral' | 'challenging';
}
```

**Define relationships:**
- One-to-many: Resolution → ProgressUpdates
- Many-to-many: (if applicable)
- Document cascade behaviors (delete, update)

**Choose storage solution:**
- localStorage: For simple, single-user apps
- Supabase: For multi-user, real-time, or complex queries
- Firebase: Alternative to Supabase
- Hybrid: localStorage + cloud sync

## Step 4: Define Component Structure (45 minutes)
**Create component hierarchy:**
```
App
├── Layout
│   ├── Header
│   ├── Navigation
│   └── Footer
├── Pages
│   ├── DashboardPage
│   │   ├── ResolutionList
│   │   │   └── ResolutionCard
│   │   └── StatsOverview
│   ├── ResolutionDetailPage
│   │   ├── ResolutionHeader
│   │   ├── ProgressTimeline
│   │   │   └── ProgressUpdateCard
│   │   └── AddProgressForm
│   └── CreateResolutionPage
│       └── ResolutionForm
└── Shared Components
    ├── Button
    ├── Input
    ├── Modal
    ├── Card
    └── LoadingSpinner
```

**For each major component, define:**
- Purpose and responsibility
- Props interface
- State (if any)
- Key behaviors
- Child components

**Example:**
```typescript
// ResolutionCard Component
Purpose: Display resolution summary with quick actions
Props: {
  resolution: Resolution;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}
State: None (presentational)
Behaviors:
  - Shows title, category, target date, status
  - Provides edit/delete/view actions
  - Visual indicator for status
  - Responsive card layout
```

## Step 5: Define State Management (30 minutes)
**Identify state categories:**
- **UI State**: Loading, errors, modals, form state
- **Application State**: Current user selections, filters, view modes
- **Server/Persistent State**: Data from storage (resolutions, updates)
- **Form State**: Form inputs, validation, submission

**Choose state management approach:**
- **Context API**: For simple, low-frequency updates
- **Zustand**: For complex state with frequent updates
- **React Hook Form**: For form-specific state
- **Local component state**: For isolated UI state

**Define state structure:**
```typescript
// Global App State (Zustand example)
interface AppState {
  // Data
  resolutions: Resolution[];
  progressUpdates: Record<string, ProgressUpdate[]>;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addResolution: (resolution: Omit<Resolution, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResolution: (id: string, updates: Partial<Resolution>) => void;
  deleteResolution: (id: string) => void;
  addProgressUpdate: (resolutionId: string, update: Omit<ProgressUpdate, 'id' | 'timestamp'>) => void;
  loadData: () => Promise<void>;
}
```

## Step 6: Define API/Data Layer (30 minutes)
**If using localStorage:**
```typescript
// Storage Service
class StorageService {
  private readonly STORAGE_KEY = 'app-data';
  
  saveResolutions(resolutions: Resolution[]): void;
  loadResolutions(): Resolution[];
  saveProgressUpdates(updates: Record<string, ProgressUpdate[]>): void;
  loadProgressUpdates(): Record<string, ProgressUpdate[]>;
  clearAll(): void;
}
```

**If using Supabase:**
```typescript
// Database Schema
Table: resolutions
  - id: uuid (primary key)
  - user_id: uuid (foreign key, if auth)
  - title: text
  - description: text
  - category: text
  - target_date: timestamp
  - status: text
  - created_at: timestamp
  - updated_at: timestamp

Table: progress_updates
  - id: uuid (primary key)
  - resolution_id: uuid (foreign key)
  - content: text
  - timestamp: timestamp
  - mood: text

// API Service
class SupabaseService {
  async getResolutions(): Promise<Resolution[]>;
  async createResolution(data: Omit<Resolution, 'id'>): Promise<Resolution>;
  async updateResolution(id: string, data: Partial<Resolution>): Promise<Resolution>;
  async deleteResolution(id: string): Promise<void>;
  async getProgressUpdates(resolutionId: string): Promise<ProgressUpdate[]>;
  async createProgressUpdate(data: Omit<ProgressUpdate, 'id'>): Promise<ProgressUpdate>;
}
```

**Define error handling strategy:**
- Network errors
- Validation errors
- Storage quota errors
- User-facing error messages

## Step 7: Define Routing & Navigation (20 minutes)
**If single-page app:**
- Define view states
- Define navigation triggers
- Define URL structure (if using hash routing)

**If multi-page app (React Router):**
```typescript
Routes:
  / → DashboardPage (list of resolutions)
  /create → CreateResolutionPage
  /resolution/:id → ResolutionDetailPage
  /resolution/:id/edit → EditResolutionPage
  * → NotFoundPage
```

**Define navigation patterns:**
- How do users move between views?
- What's the back button behavior?
- What state persists across navigation?

## Step 8: Performance Optimization Strategy (20 minutes)
**Code splitting:**
- Lazy load routes (if using React Router)
- Lazy load heavy components
- Dynamic imports for large libraries

**Rendering optimization:**
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable function references
- Virtual scrolling for long lists (if needed)

**Asset optimization:**
- Image optimization (WebP, lazy loading)
- Icon strategy (Lucide React tree-shaking)
- Font loading strategy
- CSS optimization (Tailwind purging)

**Bundle optimization:**
- Target bundle size: < 500KB initial
- Code splitting strategy
- Tree-shaking configuration
- Dependency audit

## Step 9: Security Considerations (20 minutes)
**Input validation:**
- Client-side validation (immediate feedback)
- Schema validation (Zod)
- Sanitization strategy
- XSS prevention (React's built-in)

**Data security:**
- Sensitive data handling
- localStorage encryption (if needed)
- API key management (environment variables)
- CORS configuration (if backend)

**Authentication (if applicable):**
- Auth provider (Supabase Auth, Firebase Auth)
- Token management
- Protected routes
- Session handling

## Step 10: Testing Strategy (20 minutes)
**Unit tests:**
- Utility functions
- Custom hooks
- State management logic
- Data transformations

**Component tests:**
- Rendering with different props
- User interactions
- State changes
- Error states

**Integration tests:**
- User flows
- Data persistence
- API interactions
- Navigation

**E2E tests (if applicable):**
- Critical user journeys
- Cross-browser testing
- Mobile responsiveness

**Testing tools:**
- Vitest for unit/component tests
- React Testing Library
- Playwright for E2E (if needed)

## Step 11: Deployment Configuration (15 minutes)
**Vercel configuration:**
```json
// vercel.json (if needed)
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

**Environment variables:**
- Development: `.env.local`
- Production: Vercel dashboard
- Required variables list
- Fallback values

**Build optimization:**
- Production build settings
- Source maps configuration
- Environment-specific code
- Feature flags (if applicable)

## Step 12: Create Technical Specification Document (45 minutes)
Use `/Templates/tech-spec-template.md` as your structure

**Fill in all sections:**
1. Architecture Overview
2. Data Model
3. Component Structure
4. State Management
5. API/Data Layer
6. Routing & Navigation
7. Performance Strategy
8. Security Considerations
9. Testing Strategy
10. Deployment Configuration
11. Technical Risks & Mitigations
12. Development Timeline Estimate

## Step 13: Identify Technical Risks (20 minutes)
**For each risk, document:**
- Risk description
- Likelihood (High/Medium/Low)
- Impact (High/Medium/Low)
- Mitigation strategy
- Contingency plan

**Example:**
```
RISK: Browser localStorage quota exceeded
Likelihood: Medium (if user creates many resolutions)
Impact: High (data loss, app unusable)
Mitigation: 
  - Implement data size monitoring
  - Warn user at 80% capacity
  - Provide export/archive functionality
Contingency: 
  - Fall back to IndexedDB (larger quota)
  - Migrate to Supabase for cloud storage
```

## Step 14: Provide Estimates (20 minutes)
**Break down by component:**
- Setup & configuration: X hours
- Data layer implementation: X hours
- Core components: X hours
- State management: X hours
- Styling & responsiveness: X hours
- Testing: X hours
- Bug fixes & polish: X hours
- Deployment: X hours

**Total estimate:** X hours / Y days

**Confidence level:**
- High confidence: Well-understood requirements
- Medium confidence: Some unknowns
- Low confidence: Significant unknowns

## Step 15: Review with PM & Designer (30 minutes)
**Share with PM:**
- Is this aligned with the PRD?
- Are there any scope adjustments needed?
- Are the estimates reasonable?
- Any concerns about feasibility?

**Share with Designer:**
- Does this support the intended UX?
- Are there any technical constraints on design?
- What component library/system should we use?
- Any concerns about implementation?

**Iterate based on feedback:**
- Adjust architecture if needed
- Clarify technical decisions
- Update estimates
- Document changes

## Step 16: Update Linear Epic (10 minutes)
**Add technical details to Epic:**
- Link to technical specification
- Add technical labels
- Update estimates
- Flag any blockers or dependencies

**Comment on Epic:**
```markdown
## Technical Design Complete

**Architecture:** [Brief summary]
**Tech Stack:** React 18 + TypeScript + Vite + Tailwind
**Storage:** [localStorage / Supabase / Firebase]
**Estimate:** [X hours / Y days]

**Key Technical Decisions:**
- [Decision 1 with rationale]
- [Decision 2 with rationale]

**Technical Risks:**
- [Risk 1 with mitigation]
- [Risk 2 with mitigation]

**Documentation:** [Link to tech spec]

Ready for design phase.
```

## Quality Checklist
Before moving forward:
- [ ] Architecture is clearly defined and justified
- [ ] Data model covers all entities and relationships
- [ ] Component structure is complete and logical
- [ ] State management approach is appropriate
- [ ] API/data layer is well-defined
- [ ] Performance strategy is documented
- [ ] Security considerations are addressed
- [ ] Testing strategy is defined
- [ ] Deployment configuration is specified
- [ ] Technical risks are identified with mitigations
- [ ] Estimates are provided with confidence levels
- [ ] PM has reviewed and approved
- [ ] Designer has reviewed and approved
- [ ] Tech spec is saved in project documentation

## Common Pitfalls to Avoid
- ❌ Over-engineering: Building for scale we don't need
- ❌ Under-engineering: Ignoring future extensibility
- ❌ Vague specifications: "We'll figure it out during implementation"
- ❌ Missing error handling: Only thinking happy path
- ❌ Ignoring performance: "We'll optimize later"
- ❌ No testing strategy: "We'll test manually"
- ❌ Tight coupling: Components that can't be reused
- ❌ Inconsistent patterns: Different approaches for similar problems

## Tips for Great Technical Designs
- ✅ Start simple, add complexity only when needed
- ✅ Follow established patterns from tech stack
- ✅ Make trade-offs explicit and justified
- ✅ Think about developer experience
- ✅ Consider maintenance and extensibility
- ✅ Document the "why" not just the "what"
- ✅ Identify reusable components early
- ✅ Plan for error states and edge cases
- ✅ Consider mobile-first design
- ✅ Keep components small and focused

## Output
A complete technical specification that enables:
- Designer to understand technical constraints
- TPM to create accurate tickets with estimates
- Developers to implement with clear guidance
- QA to understand system behavior
- Team to build efficiently and consistently
