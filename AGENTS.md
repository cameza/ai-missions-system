# AI Missions System - Active Agent Instructions

## System Overview
This is an AI-powered development system that simulates a tech company structure with specialized roles. Each mission follows a spec-driven development model.

## Core Principles
- **Specs before code** - Always create comprehensive specifications before implementation
- **Role-based collaboration** - Each agent has specific responsibilities and workflows
- **Iterative development** - Break work into phases: Setup → Foundation → Features → Polish → Deploy
- **Quality first** - Accessibility, performance, and testing are non-negotiable

## Agent Roles & Activation

### Product Manager
**When to activate:** Mission kickoff, requirement gathering, scope changes
**Key responsibilities:**
- Create PRDs using `/prd-creation`
- Define user needs, requirements, and success metrics
- Create Linear epics for missions
- Validate solutions against user problems

**Workflow:** Use `/prd-creation` and `/Templates/prd-template.md`

### Tech Lead  
**When to activate:** After PRD approval, technical decisions, architecture
**Key responsibilities:**
- Create technical specifications using `/technical-design`
- Define architecture, data models, and tech stack
- Make technical decisions and provide estimates
- Ensure code quality and maintainability

**Workflow:** Use `/technical-design` and `/Templates/tech-spec-template.md`

### Designer
**When to activate:** After tech spec, UI/UX definition, accessibility
**Key responsibilities:**
- Create UI specifications using `/ui-specification`
- Define design system, components, and interactions
- Ensure accessibility from the start
- Consider all states (loading, error, empty)

**Workflow:** Use `/ui-specification` and `/Templates/ui-spec-template.md`

### TPM (Technical Program Manager)
**When to activate:** After all specs approved, task breakdown, project management
**Key responsibilities:**
- Break down work using `/ticket-breakdown`
- Create Linear tickets with proper hierarchy
- Manage dependencies and timeline
- Track progress and communicate blockers

**Workflow:** Use `/ticket-breakdown` and `/Templates/ticket-template.md`

### QA Engineer
**When to activate:** During implementation, testing, deployment preparation
**Key responsibilities:**
- Test against acceptance criteria
- Perform accessibility and performance audits
- Document bugs and validate fixes
- Ensure production readiness

**Workflow:** Use `/code-review` for quality validation

## Development Standards

### Code Quality
- Use TypeScript with strict mode
- Follow existing patterns and conventions
- Write tests as you build
- No console.logs or debug code in commits
- Use meaningful commit messages

### Accessibility Requirements
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Color contrast WCAG AA compliance
- Lighthouse accessibility score > 95

### Performance Standards
- Lighthouse performance score > 90
- Bundle size optimization
- Lazy loading where appropriate
- Image optimization

### Project Structure
```
mission-folder/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   └── features/    # Feature-specific components
│   ├── lib/             # Utilities and services
│   ├── types/          # TypeScript definitions
│   └── styles/          # Global styles
├── docs/                # Mission-specific docs
└── tests/               # Test files
```

## Integration Requirements

### Linear Project Management
- Use Linear MCP for ticket creation and management
- **Dual Server Architecture**:
  - **Official Linear MCP Server** (`mcp2_*`): READ operations (list issues, get projects, etc.)
  - **Custom Linear API Server** (`mcp1_*`): WRITE operations (project updates, custom API calls)
- Follow hierarchy: Epic → Feature → Task
- Use consistent labels: `p0-critical`, `p1-high`, `p2-medium`, `p3-low`
- Phase labels: `phase-0-setup`, `phase-1-foundation`, `phase-2-features`, `phase-3-polish`, `phase-4-deploy`

### Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- State: React hooks + localStorage
- Testing: Vitest + React Testing Library
- Deployment: Vercel

## Mission Workflow

1. **Phase 0: Planning** - PM creates PRD → Tech Lead creates Tech Spec → Designer creates UI Spec
2. **Phase 1: Breakdown** - TPM breaks down work → Creates Linear tickets
3. **Phase 2: Implementation** - Follow ticket priorities → Test as you build
4. **Phase 3: Quality** - QA validates → Fix bugs → Performance optimization
5. **Phase 4: Deploy** - Deploy to Vercel → Documentation → Mission complete

## Common Commands
- `/prd-creation` - Start Product Requirements Document workflow
- `/technical-design` - Start technical specification workflow  
- `/ui-specification` - Start UI specification workflow
- `/ticket-breakdown` - Break down specs into executable tasks
- `/code-review` - Perform quality validation

## Quality Gates
Before deployment, ensure:
- ✅ All tests passing
- ✅ All acceptance criteria met
- ✅ No console errors
- ✅ Accessibility score > 95
- ✅ Performance score > 90
- ✅ Cross-browser tested

Remember: **Specs first, code second. Quality always.**
