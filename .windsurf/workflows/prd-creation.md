---
auto_execution_mode: 1
---
# PRD Creation Workflow

This workflow guides the Product Manager through creating a comprehensive Product Requirements Document (PRD).

## Prerequisites
- Mission brief document
- Understanding of tech stack and constraints
- Access to Linear for Epic creation

## Step 1: Read & Absorb (15 minutes)
**Read the mission brief carefully:**
- What's the mission title and week number?
- What's the core problem to solve?
- What's suggested in tips & tactics?
- What resources are mentioned?
- What's the expected output?

**Extract key insights:**
- User need: What problem does this solve for someone?
- Core value: What's the one thing that must work?
- Constraints: Time, tech, scope limitations
- Success: How do we know we nailed it?

## Step 2: Define the Problem (20 minutes)
**Write a clear problem statement:**
- 2-3 sentences maximum
- Focus on user pain, not solution
- Make it specific and concrete
- Explain why this matters

**Example:**
> "People set New Year's resolutions but struggle to maintain momentum. Without regular tracking and reflection, goals are forgotten within weeks. This leads to decreased motivation and a sense of failure that makes future goal-setting harder."

**Validate your problem statement:**
- Is it clear WHO has this problem?
- Is it clear WHAT the problem is?
- Is it clear WHY it matters?

## Step 3: Know Your User (20 minutes)
**Define the primary persona:**
- Who are they? (Role, context, behavior)
- What's their current situation?
- What's their goal?
- What's blocking them?

**Example:**
> **Persona: The Intentional Improver**
> - Age: 25-45, professional
> - Context: Sets 3-5 resolutions each January
> - Goal: Actually achieve goals this year
> - Blocker: Forgets to track, loses motivation

**Create user stories:**
Use format: "As a [user], I want [goal], so that [benefit]"

Examples:
- As someone with resolutions, I want to quickly log my progress, so that I stay accountable
- As a goal-setter, I want to see my overall progress, so that I stay motivated
- As a user, I want reminders to check in, so that I don't forget my goals

**Prioritize using MoSCoW:**
- **Must have**: Core MVP functionality
- **Should have**: Important but not critical
- **Could have**: Nice additions
- **Won't have** (this version): Out of scope

## Step 4: Define Functional Requirements (45 minutes)
**List all features needed for MVP:**

Format each requirement as:
```
FR-[number]: [Feature name]
Description: [What it does in 1-2 sentences]
User story: [Which user story this addresses]
Priority: Must have / Should have / Could have
```

**Example:**
```
FR-1: Create Resolution
Description: User can add a new resolution with a title, category, and target date.
User story: As a goal-setter, I want to record my resolutions, so that I can track them
Priority: Must have

FR-2: Log Progress Update
Description: User can add a text update about their progress on any resolution.
User story: As someone with resolutions, I want to quickly log my progress, so that I stay accountable
Priority: Must have
```

**Be specific about:**
- What data is captured?
- What actions are available?
- What's the expected behavior?
- What validations exist?

**Cover all key flows:**
- Create/add
- Read/view
- Update/edit
- Delete/remove
- Search/filter (if applicable)

## Step 5: Define Non-Functional Requirements (30 minutes)
**Performance:**
- Page load time: < 3 seconds
- Interaction response: < 200ms
- Smooth animations: 60fps
- Bundle size: < 500KB (initial)

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratios met
- Touch targets 44x44px minimum

**Browser/Device Support:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile: iOS Safari, Android Chrome
- Responsive: 320px to 1920px+

**Security:**
- Input validation on all forms
- XSS prevention (React's built-in)
- Secure data storage (if applicable)
- No API keys in client code
- HTTPS only (via Vercel)

**Data Persistence:**
- Choose one: localStorage, Supabase, Firebase
- State what data needs to persist
- Define data retention policy (if applicable)
- Backup/export capability (if applicable)

## Step 6: Define Success Metrics (15 minutes)
**How will we measure success?**

**Completion criteria:**
- What makes this mission "complete"?
- What must be working?
- What must be deployed?

**Example:**
> Mission complete when:
> - User can create, view, edit, and delete resolutions
> - User can log progress updates with timestamps
> - User can view progress history for each resolution
> - App is responsive on mobile/desktop
> - Deployed to Vercel and accessible via URL
> - WCAG AA accessible

**User success metrics:**
- How do we know users find this valuable?
- What behavior indicates success?

**Example:**
> User success indicators:
> - User creates 3+ resolutions
> - User logs 5+ progress updates
> - User returns to app 3+ times over 2 weeks
> - User completes setup flow in < 2 minutes

**Technical success metrics:**
- Lighthouse performance score > 90
- Lighthouse accessibility score > 95
- Zero console errors
- Works on all target browsers

## Step 7: Scope Management (20 minutes)
**Explicitly define what's IN scope:**
List the core features that MUST be built

**Explicitly define what's OUT of scope:**
Be clear about what we're NOT building

**Example:**
```
IN SCOPE:
- Create/edit/delete resolutions
- Log text-based progress updates
- View individual resolution progress
- Basic dashboard view
- Local data storage (localStorage)
- Mobile-responsive design

OUT OF SCOPE:
- User authentication / multi-user support
- Social sharing features
- AI-powered insights or coaching
- Notifications / push alerts
- Calendar integration
- Data analytics / charts
- Photo uploads
- Collaborative features
- Mobile native app
- Backend API
```

**Document assumptions:**
What are we assuming to be true?

**Example:**
```
ASSUMPTIONS:
- Single user per browser (no auth needed)
- User is motivated to manually check in
- Text-only updates are sufficient
- 2-day build timeline is adequate
- English language only
- Standard web browser access
```

**List open questions:**
What needs to be resolved?

**Example:**
```
OPEN QUESTIONS:
- Should resolutions have categories/tags?
- Do we need data export functionality?
- Should there be a "streak" tracking feature?
- Do we show analytics/charts of progress?
- Is there a max number of resolutions?
```

## Step 8: Create PRD Document (30 minutes)
Use `/Templates/prd-template.md` as your structure

**Fill in all sections:**
1. Overview
2. Problem Statement
3. User Persona
4. User Stories
5. Functional Requirements
6. Non-Functional Requirements
7. Success Metrics
8. Scope (In/Out/Assumptions)
9. Open Questions
10. References

**Make it readable:**
- Use clear headings
- Use bullet points and lists
- Be specific, not vague
- Include examples where helpful
- Link to external resources

## Step 9: Create Linear Epic (15 minutes)
**Create Epic in Linear:**
1. Title: "Week [N]: [Mission Name]"
2. Description:
   - Brief overview (2-3 sentences)
   - Link to PRD document
   - Key requirements summary
   - Success criteria summary
3. Labels: `mission`, `week-[N]`, `prd`
4. Status: "In Progress" (during PRD creation)
5. Project: "AI Missions" (or your project name)

**Epic description template:**
```markdown
# Week [N]: [Mission Name]

## Overview
[2-3 sentence summary of what we're building and why]

## Documentation
- PRD: [link to PRD file]
- Mission Brief: [link to mission brief]

## Key Requirements
- [Must-have requirement 1]
- [Must-have requirement 2]
- [Must-have requirement 3]

## Success Criteria
- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]

## Timeline
Target completion: [Date]
Phase breakdown: [Will be added by TPM]
```

## Step 10: Review & Iterate (30-60 minutes)
**Share PRD with Tech Lead:**
- Ask: Is this technically feasible?
- Ask: What are the technical risks?
- Ask: What would you change to make this easier to build?
- Listen to feedback
- Adjust scope if needed

**Share PRD with Designer:**
- Ask: Can we create a great UX for this?
- Ask: What's the interaction model?
- Ask: What would improve the UX?
- Listen to feedback
- Adjust requirements if needed

**Iterate based on feedback:**
- Clarify ambiguous requirements
- Adjust scope to be realistic
- Add technical constraints to Non-Functional Requirements
- Document decisions made

**Get sign-off:**
- Tech Lead approves feasibility
- Designer approves UX approach
- Update Linear Epic status to "Ready"
- Proceed to technical design phase

## Quality Checklist
Before moving forward:
- [ ] Problem statement is clear and compelling
- [ ] User persona is well-defined
- [ ] User stories follow proper format
- [ ] All functional requirements are specific and testable
- [ ] Non-functional requirements are documented
- [ ] Success metrics are measurable
- [ ] Scope is explicitly defined (in/out)
- [ ] Assumptions are documented
- [ ] Open questions are listed
- [ ] Linear Epic is created and linked
- [ ] Tech Lead has reviewed and approved
- [ ] Designer has reviewed and approved
- [ ] PRD is saved in project documentation folder

## Common Pitfalls to Avoid
- ❌ Being too vague: "User-friendly interface"
- ❌ Solution-first thinking: Describing HOW not WHAT
- ❌ Scope creep: Trying to build everything
- ❌ Missing edge cases: Only thinking happy path
- ❌ No prioritization: Everything is P0
- ❌ Ignoring constraints: Not considering time/tech limits
- ❌ Skipping reviews: Not getting feedback early

## Tips for Great PRDs
- ✅ Start with WHY (user problem)
- ✅ Be specific and measurable
- ✅ Use examples to clarify
- ✅ Think in user flows, not features
- ✅ Prioritize ruthlessly
- ✅ Define "done" clearly
- ✅ Leave room for design creativity
- ✅ Consider the whole UX, not just features
- ✅ Think about error states and edge cases
- ✅ Make trade-offs explicit

## Output
A complete PRD document that enables:
- Tech Lead to design a feasible architecture
- Designer to create an intuitive UX
- TPM to break down into executable tickets
- QA to validate against clear criteria
- Team to build with confidence
