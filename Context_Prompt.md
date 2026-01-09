# Overview
I'm entering an AI challenge to complete 10 AI missions. The first mission is to actually build an AI-powered tracker to manage the 10 missions.

Before going ahead and building anything, I'd like to structure a system that I can use across each mission. The system should reflect the processes and roles that a tech company would follow to build their products. For example:
* A Product Manager role that takes the problem to solve (i.e. Mission Brief) and works with engineering and design to put together a Product Spec or PRD. 
* An architect or engineering lead that takes the product spec/PRD and comes up with a proposed solution that is feasible
* A Designer that takes the Product Spec and the engineering solution and comes up with the necessary elements to make the solution usable (UX/UI)
* A TPM that takes the Product Spec - when ready - to break down the work into tickets so that the development work can be split, assigned and executed

# Context
## Initial Elements Outline
I have started outlining the elements of this system and I'd like your help in completing it. 
* Do note that the idea here is that each of the roles is led by an AI agent. Documenting the agent instructions prompt for each would be required as part of the exercise. 
* I plan to use windsurf as the main tool for building each mission. Each mission can be a separate windsurf project/folder/workspace
* I'd like to use a stack that's common these days and that would be easily moved into production using tools like Vercel. 
* We can create workflows within Windsurf for repetitive tasks and then have the agents call these workflows as needed. For example, we could have a workflow that outlines how to create a product spec/prd (template, sections, guidelines). 
* We can have a markdown file per agent/role and use cascade (context windows) to use for each agent. 
* We can use Linear as the tool to manage the project, create tickets (issues) and track completion of the work. (I already have a Linear API / MCP to use in windsurf)

## Product Spec Model: 
Find in this url my thoughts around the Product Spec operating model, which I'd like to use for this system. - https://camilomeza.framer.ai/writing/our-illustration-process

## System Architecture Overview
* Core Components:
* Agent Roles & Responsibilities
* Workflow Process
* Documentation Structure
* Tooling & Integration
* Tech Stack

## Directory Structure
ai-missions-system/
├── Agents/
│   ├── product-manager.md
│   ├── tech-lead.md
│   ├── designer.md
│   ├── tpm.md
│   └── qa-engineer.md
├── Workflows/
│   ├── prd-creation.md
│   ├── technical-design.md
│   ├── ui-specification.md
│   ├── ticket-breakdown.md
│   └── code-review.md
├── Templates/
│   ├── prd-template.md
│   ├── tech-spec-template.md
│   ├── ui-spec-template.md
│   └── ticket-template.md
├── Missions/
│   ├── week-01-resolution-tracker/
│   ├── week-02-model-mapping/
│   └── ...
└── Docs/
    ├── system-guide.md
    └── tech-stack.md

## Implementation Process
For Each Mission:

1. Kickoff (PM Agent)
- Read mission brief
- Create PRD using workflow
- Create Epic in Linear

2. Technical Planning (Tech Lead Agent)
- Review PRD
- Create technical specification
- Provide estimates
- Flag any blockers

3. Design (Designer Agent)
- Review PRD + Tech Spec
- Create UI specification
- Define component structure

4. Planning (TPM Agent)
- Review all specs
- Break down into Linear tickets
- Set up dependencies
- Create timeline

5. Implementation
- Work through tickets in priority order
- Use cascades to reference specs
- Commit regularly with meaningful messages

6. QA (QA Agent)
- Test against acceptance criteria
- Document bugs
- Verify completion

7. Completion
- Deploy to Vercel
- Update mission tracker
- Document learnings

## Standard Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (optional, for complex UIs)
- **Icons**: Lucide React or Heroicons
- **Forms**: React Hook Form + Zod
- **State**: Context API / Zustand
- **Routing**: React Router (if needed)

### Backend (when needed)
- **Runtime**: Vercel Serverless Functions
- **API**: RESTful or tRPC
- **Validation**: Zod

### Database & Storage
- **Primary**: Supabase (PostgreSQL + Auth + Storage)
- **Alternative**: Firebase
- **Client-only**: localStorage with encryption

### Development
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky + lint-staged

### Deployment
- **Platform**: Vercel
- **CI/CD**: Vercel's built-in pipeline
- **Environment Variables**: Vercel env management

### Testing (as needed)
- **Unit**: Vitest
- **E2E**: Playwright