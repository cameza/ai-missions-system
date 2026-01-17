---
auto_execution_mode: 1
---
# Development Code Implementation Workflow

This workflow guides the systematic implementation of Linear tickets following the Tech Lead's implementation plan from comments.

## Prerequisites
- Linear issue with Tech Lead implementation plan in comments
- Access to Linear MCP server
- Development environment set up
- Understanding of project architecture and conventions

## Step 1: Read Linear Issue Details

**Action:** Use Linear MCP server to retrieve issue information

**Commands:**
```bash
# Read the main issue details
mcp2_get_issue(id="ISSUE-ID")

# Read implementation plan from comments
mcp2_list_comments(issueId="ISSUE-ID")
```

**What to look for:**
- Issue title and description
- Acceptance criteria
- Technical requirements
- Dependencies on other issues
- Priority and labels

## Step 2: Analyze Implementation Plan

**Review Tech Lead's comment for:**
- Step-by-step implementation instructions
- Technical specifications and requirements
- Database schema changes
- API endpoints needed
- Testing requirements
- Documentation requirements

**Key questions to answer:**
- What are the main implementation phases?
- Are there any external dependencies?
- What tools/services need to be configured?
- What are the testing requirements?
- Are there any security considerations?

## Step 3: Mark Issue as In Progress

**Action:** Update Linear issue status to begin implementation

**Command:**
```bash
mcp2_update_issue(id="ISSUE-ID", state="In Progress")
```

**Purpose:** 
- Signal to team that work has begun
- Prevent duplicate work
- Enable progress tracking

## Step 4: Implementation Phase

### 4.1 Setup and Configuration
**Follow the Tech Lead's plan for:**
- Creating/configuring external services (Supabase, Vercel, etc.)
- Setting up environment variables
- Configuring databases or APIs
- Installing dependencies
- Setting up project structure

### 4.2 Core Implementation
**Implement according to the plan:**
- Create database schemas/migrations
- Implement API endpoints
- Build UI components
- Set up data pipelines
- Configure authentication/security

### 4.3 Testing and Validation
**Test the implementation:**
- Unit tests for core functionality
- Integration tests for APIs
- Manual testing of UI components
- Performance testing
- Security validation

### 4.4 Documentation
**Create/update documentation:**
- API documentation
- Database schema docs
- Setup guides
- Troubleshooting guides
- README updates

## Step 5: Quality Assurance

**Self-review checklist:**
- [ ] All acceptance criteria met
- [ ] Code follows project conventions
- [ ] Tests are passing
- [ ] Documentation is complete
- [ ] Security requirements met
- [ ] Performance requirements met
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Logging added where needed

## Step 6: Mark Issue as In Review

**Action:** Update Linear issue status for QA review

**Command:**
```bash
mcp2_update_issue(id="ISSUE-ID", state="In Review")
```

**Purpose:**
- Signal implementation is complete
- Hand off to QA team for validation
- Enable formal review process

## Step 7: Implementation Complete

**Final verification:**
- [ ] All code committed to feature branch
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Testing completed
- [ ] Issue status updated to "In Review"

## Common Implementation Patterns

### Database Setup (like MCS-94)
1. Create project/service
2. Apply schema migrations
3. Set up indexes and constraints
4. Configure security policies
5. Create helper functions
6. Add sample data
7. Document connection details

### API Development
1. Define data models/types
2. Implement endpoints
3. Add validation and error handling
4. Write tests
5. Document API
6. Set up authentication

### Frontend Components
1. Create component structure
2. Implement UI according to design
3. Add state management
4. Handle loading/error states
5. Make responsive
6. Add accessibility features

## Error Handling During Implementation

**Common issues and solutions:**
- **Migration conflicts:** Use descriptive names and check existing schema
- **Type errors:** Ensure proper TypeScript types
- **API failures:** Check authentication and permissions
- **Build errors:** Verify dependencies and imports
- **Test failures:** Debug test setup and assertions

## Communication Guidelines

**During implementation:**
- Update Linear ticket with progress notes
- Flag blockers or questions immediately
- Share learnings with team
- Document decisions made

**When complete:**
- Summarize what was implemented
- Note any deviations from the plan
- Highlight areas needing special attention
- Provide testing instructions

## Example Implementation Flow (MCS-94)

```
1. Read MCS-94 issue → Found database setup requirements
2. Read comments → Tech Lead provided detailed 7-step plan
3. Mark In Progress → Signal work started
4. Implementation:
   - Created Supabase project
   - Applied migrations for leagues, clubs, transfers tables
   - Set up indexes and RLS policies
   - Created helper functions
   - Added sample data
   - Fixed security/performance issues
5. Self-review → All AC met, tests passing
6. Mark In Review → Ready for QA validation
```

## Output

A systematic implementation that:
- Follows Tech Lead's specifications exactly
- Meets all acceptance criteria
- Maintains code quality standards
- Includes proper testing and documentation
- Enables smooth handoff to QA team
- Provides clear progress tracking

## Success Metrics

- ✅ Issue moved from "Todo" → "In Progress" → "In Review"
- ✅ All acceptance criteria implemented
- ✅ Code passes self-review checklist
- ✅ Documentation created and updated
- ✅ Ready for QA validation without blockers
