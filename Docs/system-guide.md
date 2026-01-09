# AI Missions System Guide

## Overview

This system provides a structured approach to building AI-powered applications by simulating the roles and processes of a tech company. Each mission follows a spec-driven development model where AI agents take on specific roles (Product Manager, Tech Lead, Designer, TPM, QA Engineer) to deliver production-ready applications.

---

## System Philosophy

### Spec-Driven Development
The system follows a **spec-first approach** where specifications define the "what" and "why" before implementation defines the "how" and "when."

**Key Principles:**
1. **Specs before code** - Write comprehensive specifications before writing any code
2. **Clarity over speed** - Take time to define requirements clearly
3. **Collaboration** - Each role reviews and approves specs before moving forward
4. **Iteration** - Specs evolve based on feedback and learnings
5. **Documentation** - All decisions and rationale are documented

### Agent Roles

Each agent has a specific responsibility and operates within defined workflows:

- **Product Manager** - Defines what to build and why
- **Tech Lead** - Defines how to build it technically
- **Designer** - Defines the user experience and interface
- **TPM** - Breaks down work into executable tasks
- **QA Engineer** - Validates quality and completeness

---

## Directory Structure

```
ai-missions-system/
├── Agents/               # Agent role definitions and instructions
│   ├── product-manager.md
│   ├── tech-lead.md
│   ├── designer.md
│   ├── tpm.md
│   └── qa-engineer.md
├── Workflows/            # Step-by-step workflows for each process
│   ├── prd-creation.md
│   ├── technical-design.md
│   ├── ui-specification.md
│   ├── ticket-breakdown.md
│   └── code-review.md
├── Templates/            # Templates for consistent documentation
│   ├── prd-template.md
│   ├── tech-spec-template.md
│   ├── ui-spec-template.md
│   └── ticket-template.md
├── Missions/             # Individual mission workspaces
│   ├── week-01-resolution-tracker/
│   ├── week-02-model-mapping/
│   └── ...
└── Docs/                 # System documentation
    ├── system-guide.md   # This file
    └── tech-stack.md     # Standard tech stack reference
```

---

## Mission Lifecycle

### Phase 0: Kickoff & Planning

**Objective:** Understand the mission and create comprehensive specifications

**Steps:**
1. **Read Mission Brief** - Understand the problem and requirements
2. **Create PRD** (Product Manager)
   - Use `/Workflows/prd-creation.md`
   - Use `/Templates/prd-template.md`
   - Define problem, user needs, requirements, success metrics
3. **Create Technical Specification** (Tech Lead)
   - Use `/Workflows/technical-design.md`
   - Use `/Templates/tech-spec-template.md`
   - Define architecture, data model, components, tech decisions
4. **Create UI Specification** (Designer)
   - Use `/Workflows/ui-specification.md`
   - Use `/Templates/ui-spec-template.md`
   - Define screens, interactions, design system, accessibility
5. **Review & Approve** - All roles review and approve specs
6. **Create Epic in Linear** - Document mission in project management tool

### Phase 1: Task Breakdown

**Objective:** Break down specs into executable tickets

**Steps:**
1. **Review All Specs** (TPM)
   - Understand all requirements and technical approach
2. **Create Ticket Breakdown**
   - Use `/Workflows/ticket-breakdown.md`
   - Use `/Templates/ticket-template.md`
   - Break work into phases: Setup → Foundation → Features → Polish → Deploy
3. **Map Dependencies** - Identify what blocks what
4. **Assign Priorities** - P0 (critical) to P3 (nice-to-have)
5. **Estimate Effort** - XS (2-3h) to L (2 days)
6. **Create Tickets in Linear** - Use Linear MCP to create all tickets
7. **Team Review** - Validate breakdown with all roles

### Phase 2: Implementation

**Objective:** Build the application following the specs

**Steps:**
1. **Setup Phase** (Phase 0 tickets)
   - Initialize project with Vite + React + TypeScript
   - Configure Tailwind CSS
   - Set up folder structure
   - Configure linting and formatting
2. **Foundation Phase** (Phase 1 tickets)
   - Define TypeScript types
   - Implement storage service
   - Set up state management
   - Create base UI components
3. **Core Features Phase** (Phase 2 tickets)
   - Implement primary user flows
   - Build feature components
   - Integrate with state and storage
   - Handle basic errors
4. **Polish Phase** (Phase 3 tickets)
   - Responsive design
   - Animations and transitions
   - Comprehensive error handling
   - Loading and empty states
   - Accessibility improvements
5. **Quality Phase** (Phase 4 tickets)
   - Write tests
   - Accessibility audit
   - Performance optimization
   - Bug fixes

### Phase 3: Quality Assurance

**Objective:** Validate the application meets all requirements

**Steps:**
1. **Functional Testing** (QA Engineer)
   - Test all acceptance criteria
   - Test all user flows
   - Test edge cases
2. **Accessibility Testing**
   - Keyboard navigation
   - Screen reader testing
   - Color contrast validation
   - Lighthouse accessibility audit
3. **Performance Testing**
   - Lighthouse performance audit
   - Bundle size analysis
   - Load time testing
4. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Android Chrome)
5. **Bug Reporting & Fixing**
   - Document bugs in Linear
   - Prioritize and fix
   - Retest after fixes

### Phase 4: Deployment & Documentation

**Objective:** Deploy to production and document learnings

**Steps:**
1. **Pre-Deployment Checklist**
   - All tests passing
   - All acceptance criteria met
   - No console errors
   - Accessibility score > 95
   - Performance score > 90
2. **Deploy to Vercel**
   - Configure environment variables
   - Deploy production build
   - Verify deployment
   - Test production URL
3. **Documentation**
   - Update README with deployment URL
   - Document any known issues
   - Document learnings
4. **Mission Completion**
   - Update mission tracker
   - Close Linear epic
   - Retrospective (what went well, what to improve)

---

## Using AI Agents

### Activating an Agent

To use an agent, load their context in Cascade:

1. Open the agent file (e.g., `/Agents/product-manager.md`)
2. Use the file as context in your Cascade conversation
3. The agent will follow their defined role and workflows

### Agent Workflows

Each agent has specific workflows they follow:

**Product Manager:**
- Creates PRDs using `/Workflows/prd-creation.md`
- Defines user needs and requirements
- Creates Linear epics

**Tech Lead:**
- Creates technical specifications using `/Workflows/technical-design.md`
- Makes architectural decisions
- Provides technical estimates

**Designer:**
- Creates UI specifications using `/Workflows/ui-specification.md`
- Defines design system and components
- Ensures accessibility

**TPM:**
- Breaks down work using `/Workflows/ticket-breakdown.md`
- Creates tickets in Linear
- Manages dependencies and timeline

**QA Engineer:**
- Tests against acceptance criteria
- Performs accessibility and performance audits
- Documents bugs

### Collaboration Between Agents

Agents collaborate through spec reviews:

1. **PM creates PRD** → Tech Lead and Designer review
2. **Tech Lead creates Tech Spec** → PM and Designer review
3. **Designer creates UI Spec** → PM and Tech Lead review
4. **TPM creates Ticket Breakdown** → All roles review
5. **Implementation** → QA validates

---

## Linear Integration

### Setup

The system integrates with Linear for project management:

1. **Linear MCP** - Use the Linear MCP server in Windsurf
2. **Project Structure:**
   - One project: "AI Missions"
   - One epic per mission
   - Features grouped under epics
   - Tasks grouped under features

### Ticket Hierarchy

```
Epic: Week 1 - Resolution Tracker
├── Feature: Project Setup
│   ├── Task: Initialize Vite Project
│   ├── Task: Configure Tailwind
│   └── Task: Set Up Folder Structure
├── Feature: Data Layer
│   ├── Task: Define TypeScript Types
│   ├── Task: Implement Storage Service
│   └── Task: Set Up State Management
└── Feature: Goal Management
    ├── Task: Goal List Component
    ├── Task: Goal Form Component
    └── Task: Goal Detail View
```

### Labels

Use consistent labels for organization:

- **Type:** `setup`, `feature`, `component`, `bug`, `enhancement`, `refactor`
- **Priority:** `p0-critical`, `p1-high`, `p2-medium`, `p3-low`
- **Phase:** `phase-0-setup`, `phase-1-foundation`, `phase-2-features`, `phase-3-polish`, `phase-4-deploy`
- **Area:** `frontend`, `backend`, `design`, `accessibility`, `performance`

---

## Best Practices

### Specification Writing

**Do:**
- ✅ Be specific and measurable
- ✅ Include examples and context
- ✅ Define success criteria clearly
- ✅ Document assumptions and constraints
- ✅ Link to related resources
- ✅ Get feedback early and often

**Don't:**
- ❌ Be vague or ambiguous
- ❌ Skip edge cases
- ❌ Assume knowledge
- ❌ Write specs in isolation
- ❌ Forget to update specs when things change

### Implementation

**Do:**
- ✅ Follow the specs
- ✅ Write clean, maintainable code
- ✅ Test as you build
- ✅ Commit regularly with meaningful messages
- ✅ Ask for clarification when specs are unclear
- ✅ Update tickets as you progress

**Don't:**
- ❌ Deviate from specs without discussion
- ❌ Skip testing
- ❌ Leave console.logs or debug code
- ❌ Ignore accessibility
- ❌ Over-engineer solutions

### Code Review

**Do:**
- ✅ Review against acceptance criteria
- ✅ Test the code locally
- ✅ Provide constructive feedback
- ✅ Acknowledge good work
- ✅ Explain reasoning for suggestions

**Don't:**
- ❌ Rubber stamp approvals
- ❌ Nitpick style (use linters)
- ❌ Be vague in feedback
- ❌ Block on personal preferences

---

## Common Workflows

### Starting a New Mission

1. Create mission folder: `/Missions/week-XX-mission-name/`
2. Read mission brief
3. Activate Product Manager agent
4. Create PRD following workflow
5. Activate Tech Lead agent
6. Create Tech Spec following workflow
7. Activate Designer agent
8. Create UI Spec following workflow
9. Review and approve all specs
10. Activate TPM agent
11. Create ticket breakdown
12. Create tickets in Linear
13. Begin implementation

### Handling Scope Changes

1. Update relevant spec (PRD, Tech Spec, or UI Spec)
2. Document reason for change
3. Get approval from affected roles
4. Update tickets in Linear
5. Communicate changes to team
6. Proceed with updated scope

### Dealing with Blockers

1. Document blocker in Linear ticket
2. Escalate to appropriate role:
   - Technical blocker → Tech Lead
   - Requirements unclear → Product Manager
   - Design question → Designer
   - Timeline issue → TPM
3. Resolve blocker
4. Update ticket and continue

---

## Tips for Success

### For Product Managers
- Start with the user problem, not the solution
- Be specific about requirements
- Define clear success metrics
- Prioritize ruthlessly
- Get feedback early

### For Tech Leads
- Choose simple solutions over clever ones
- Document architectural decisions
- Consider maintainability
- Identify risks early
- Provide realistic estimates

### For Designers
- Design for accessibility from the start
- Keep it simple and intuitive
- Use consistent patterns
- Consider all states (loading, error, empty)
- Test with real users if possible

### For TPMs
- Break work into small, manageable chunks
- Make dependencies explicit
- Be realistic with estimates
- Communicate blockers early
- Keep tickets up to date

### For QA Engineers
- Test early and often
- Think about edge cases
- Validate against specs
- Document bugs clearly
- Celebrate quality wins

---

## Troubleshooting

### Specs Taking Too Long
- Use templates to speed up process
- Focus on must-haves first
- Get feedback in parallel
- Time-box spec creation

### Implementation Falling Behind
- Review estimates (were they realistic?)
- Identify blockers
- Reduce scope if needed
- Parallelize work where possible

### Quality Issues
- Allocate more time for testing
- Add automated tests
- Do code reviews
- Use linters and formatters

### Unclear Requirements
- Go back to specs
- Ask Product Manager for clarification
- Document assumptions
- Get sign-off before proceeding

---

## Resources

### Internal Resources
- Agent definitions: `/Agents/`
- Workflows: `/Workflows/`
- Templates: `/Templates/`
- Tech stack: `/Docs/tech-stack.md`

### External Resources
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- Vercel: https://vercel.com/docs
- Linear: https://linear.app/docs

---

## Conclusion

This system provides structure and consistency across missions while maintaining flexibility for different types of projects. By following the spec-driven approach and leveraging AI agents for different roles, you can build high-quality applications efficiently.

Remember: **Specs first, code second. Quality always.**
