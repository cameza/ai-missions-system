# Code Review Workflow

This workflow guides the review process for code changes to ensure quality, consistency, and maintainability.

## Prerequisites
- Completed ticket with code changes
- Understanding of project standards and conventions
- Access to codebase and git repository
- Familiarity with PRD and technical specification

## Review Types

### 1. Self-Review (Before Requesting Review)
**Time: 10-15 minutes**
Every developer should self-review before requesting peer review.

### 2. Peer Review (Standard Review)
**Time: 20-30 minutes**
Another developer reviews the code for quality and correctness.

### 3. Tech Lead Review (Complex Changes)
**Time: 30-45 minutes**
Tech lead reviews architectural decisions and complex implementations.

## Step 1: Self-Review Checklist (Pre-Submission)

**Functionality:**
- [ ] Code solves the problem described in the ticket
- [ ] All acceptance criteria are met
- [ ] Edge cases are handled
- [ ] Error states are handled gracefully
- [ ] Loading states are implemented
- [ ] Code works as expected locally

**Code Quality:**
- [ ] Code follows project conventions
- [ ] Variable/function names are descriptive
- [ ] Functions are small and focused (<50 lines)
- [ ] No commented-out code
- [ ] No console.logs or debug code
- [ ] No hardcoded values (use constants/config)
- [ ] DRY principle followed (no duplication)

**TypeScript:**
- [ ] No `any` types (use proper types)
- [ ] No TypeScript errors
- [ ] Interfaces/types properly defined
- [ ] Props interfaces documented
- [ ] Type guards used where needed

**React Best Practices:**
- [ ] Components are properly structured
- [ ] Hooks used correctly (dependencies, cleanup)
- [ ] No unnecessary re-renders
- [ ] Props properly typed
- [ ] State managed appropriately
- [ ] Side effects in useEffect
- [ ] Memoization used where beneficial

**Styling:**
- [ ] Follows design specification
- [ ] Responsive on all screen sizes
- [ ] Tailwind classes used consistently
- [ ] No inline styles (unless necessary)
- [ ] Animations smooth (60fps)
- [ ] Dark mode support (if applicable)

**Accessibility:**
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets standards
- [ ] Alt text for images
- [ ] Form labels properly associated

**Performance:**
- [ ] No unnecessary API calls
- [ ] Images optimized
- [ ] Large lists virtualized (if needed)
- [ ] Code splitting used appropriately
- [ ] No memory leaks
- [ ] Efficient algorithms used

**Testing:**
- [ ] Unit tests written for utilities
- [ ] Component tests written
- [ ] Tests are meaningful (not just coverage)
- [ ] All tests passing
- [ ] Edge cases tested

**Documentation:**
- [ ] Complex logic commented
- [ ] JSDoc for public APIs
- [ ] README updated (if needed)
- [ ] Ticket updated with notes

**Git:**
- [ ] Commit messages are descriptive
- [ ] Commits are logical units
- [ ] No merge conflicts
- [ ] Branch is up to date with main

## Step 2: Request Review

**Create clear review request:**
```markdown
## Changes
Brief description of what was changed and why.

## Ticket
Link to Linear ticket: [PROJ-123]

## Testing
How to test these changes:
1. Step 1
2. Step 2
3. Expected result

## Screenshots/Videos
[If UI changes, include before/after screenshots]

## Notes for Reviewer
- Any specific areas to focus on
- Any trade-offs or decisions made
- Any known limitations
```

**Tag appropriate reviewers:**
- Peer developer for standard review
- Tech lead for architectural changes
- Designer for UI changes

## Step 3: Peer Review Process

**First Pass - High Level (5 minutes):**
- [ ] Read the ticket to understand requirements
- [ ] Review the PR description
- [ ] Understand the overall approach
- [ ] Check if changes align with ticket

**Second Pass - Code Quality (15 minutes):**

**Architecture & Design:**
- [ ] Follows established patterns
- [ ] Component structure is logical
- [ ] Separation of concerns maintained
- [ ] No tight coupling
- [ ] Reusable components identified
- [ ] State management appropriate

**Code Readability:**
- [ ] Code is easy to understand
- [ ] Naming is clear and consistent
- [ ] Functions have single responsibility
- [ ] Complex logic is explained
- [ ] No overly clever code

**TypeScript Usage:**
- [ ] Types are accurate and helpful
- [ ] No unnecessary type assertions
- [ ] Generics used appropriately
- [ ] Type safety maintained

**React Patterns:**
- [ ] Hooks used correctly
- [ ] Component lifecycle handled properly
- [ ] Props drilling avoided (if excessive)
- [ ] Context used appropriately
- [ ] Performance optimizations appropriate

**Error Handling:**
- [ ] Errors are caught and handled
- [ ] User-friendly error messages
- [ ] Fallback UI for errors
- [ ] Logging for debugging

**Security:**
- [ ] Input validation present
- [ ] No XSS vulnerabilities
- [ ] No sensitive data exposed
- [ ] API keys not hardcoded

**Third Pass - Testing & Edge Cases (10 minutes):**
- [ ] Tests cover main functionality
- [ ] Edge cases are tested
- [ ] Error cases are tested
- [ ] Tests are maintainable
- [ ] No flaky tests

**Pull locally and test:**
- [ ] Code runs without errors
- [ ] Features work as described
- [ ] UI matches design (if applicable)
- [ ] Responsive on mobile
- [ ] Accessible with keyboard
- [ ] No console errors

## Step 4: Provide Feedback

**Feedback Categories:**

**🔴 Blocking (Must Fix):**
- Breaks functionality
- Security vulnerability
- Performance issue
- Accessibility violation
- Does not meet requirements

**🟡 Non-Blocking (Should Fix):**
- Code quality improvement
- Better naming
- Refactoring opportunity
- Missing test
- Documentation needed

**🟢 Suggestion (Nice to Have):**
- Alternative approach
- Future enhancement
- Learning opportunity
- Style preference

**Feedback Format:**
```markdown
**[Category] [File:Line]**
[Clear description of issue]

Current:
```code
[Current code]
```

Suggested:
```code
[Suggested code]
```

Reasoning:
[Why this change is important]
```

**Example:**
```markdown
**🔴 Blocking - ResolutionCard.tsx:45**
Missing error handling for delete operation.

Current:
```typescript
const handleDelete = () => {
  deleteResolution(id);
};
```

Suggested:
```typescript
const handleDelete = async () => {
  try {
    await deleteResolution(id);
    toast.success('Resolution deleted');
  } catch (error) {
    toast.error('Failed to delete resolution');
    console.error(error);
  }
};
```

Reasoning:
Users need feedback when operations fail. Without error handling, failed deletes would be silent.
```

## Step 5: Feedback Guidelines

**Be Constructive:**
- ✅ "Consider extracting this into a custom hook for reusability"
- ❌ "This code is messy"

**Be Specific:**
- ✅ "This function is 150 lines. Consider breaking it into smaller functions"
- ❌ "This function is too long"

**Explain Why:**
- ✅ "Using useCallback here prevents unnecessary re-renders of child components"
- ❌ "Use useCallback here"

**Suggest Solutions:**
- ✅ "We could use a Map instead of an array for O(1) lookups"
- ❌ "This is slow"

**Acknowledge Good Work:**
- ✅ "Great use of TypeScript generics here!"
- ✅ "This component structure is very clean"
- ✅ "Excellent test coverage"

**Ask Questions:**
- ✅ "What's the reasoning behind this approach?"
- ✅ "Have you considered using X instead?"
- ✅ "Could this cause issues if Y happens?"

## Step 6: Author Response

**Address all feedback:**
- [ ] Respond to each comment
- [ ] Make requested changes
- [ ] Explain decisions if not changing
- [ ] Ask for clarification if needed

**Response format:**
```markdown
**Fixed** ✅
[Description of fix or link to commit]

**Won't Fix** ⏭️
[Explanation of why not changing]

**Question** ❓
[Ask for clarification]
```

**Make changes:**
- Fix blocking issues immediately
- Consider non-blocking suggestions
- Discuss alternative approaches
- Update tests if needed

**Request re-review:**
- Tag reviewer when changes are ready
- Summarize what was changed
- Highlight any areas needing re-check

## Step 7: Final Approval

**Reviewer verifies:**
- [ ] All blocking issues resolved
- [ ] Non-blocking issues addressed or explained
- [ ] Code still works after changes
- [ ] Tests still passing
- [ ] No new issues introduced

**Approve and merge:**
- [ ] Leave approval comment
- [ ] Merge to main branch
- [ ] Delete feature branch
- [ ] Update Linear ticket status
- [ ] Notify team if needed

## Step 8: Post-Merge

**Author:**
- [ ] Verify deployment successful
- [ ] Monitor for errors
- [ ] Update documentation if needed
- [ ] Close Linear ticket

**Reviewer:**
- [ ] Available for questions
- [ ] Monitor for issues
- [ ] Share learnings with team

## Common Review Scenarios

### Scenario 1: Large PR (>500 lines)
**Problem:** Too much to review effectively

**Solution:**
- Ask author to break into smaller PRs
- Review in multiple sessions
- Focus on critical paths first
- Use code review tools for context

### Scenario 2: Disagreement on Approach
**Problem:** Reviewer and author have different opinions

**Solution:**
- Discuss trade-offs objectively
- Reference project standards
- Escalate to tech lead if needed
- Document decision for future reference

### Scenario 3: Urgent Hotfix
**Problem:** Needs to be merged quickly

**Solution:**
- Focus on critical issues only
- Verify fix works
- Create follow-up ticket for improvements
- Expedited review process

### Scenario 4: Learning Opportunity
**Problem:** Junior developer needs guidance

**Solution:**
- Be extra thorough with explanations
- Provide examples and resources
- Pair program if needed
- Celebrate good practices

## Code Review Anti-Patterns

**❌ Nitpicking:**
- Focusing on trivial style issues
- Blocking on personal preferences
- Ignoring automated linting

**❌ Rubber Stamping:**
- Approving without actually reviewing
- Not testing the code
- Skipping edge cases

**❌ Being Vague:**
- "This could be better"
- "I don't like this"
- No specific suggestions

**❌ Being Harsh:**
- Personal attacks
- Dismissive comments
- Not acknowledging good work

**❌ Scope Creep:**
- Requesting unrelated changes
- Asking for new features
- Expanding requirements

## Code Review Best Practices

**✅ Review Promptly:**
- Review within 24 hours
- Don't block progress
- Communicate delays

**✅ Be Thorough:**
- Actually run the code
- Test edge cases
- Check all files

**✅ Be Respectful:**
- Assume good intent
- Be kind and constructive
- Acknowledge effort

**✅ Focus on Impact:**
- Prioritize blocking issues
- Don't nitpick style
- Consider maintainability

**✅ Share Knowledge:**
- Explain reasoning
- Provide resources
- Teach best practices

**✅ Be Consistent:**
- Apply same standards to all
- Follow project conventions
- Reference documentation

## Review Checklist Template

Copy this for each review:

```markdown
## Code Review Checklist

### Functionality
- [ ] Meets ticket requirements
- [ ] All acceptance criteria met
- [ ] Edge cases handled
- [ ] Error handling implemented

### Code Quality
- [ ] Follows project conventions
- [ ] Clear and readable
- [ ] No code duplication
- [ ] Appropriate abstractions

### TypeScript
- [ ] Proper types used
- [ ] No `any` types
- [ ] Type safety maintained

### React
- [ ] Components well-structured
- [ ] Hooks used correctly
- [ ] No unnecessary re-renders
- [ ] Props properly typed

### Testing
- [ ] Tests written and passing
- [ ] Edge cases covered
- [ ] Meaningful assertions

### Accessibility
- [ ] Semantic HTML
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Color contrast

### Performance
- [ ] No obvious bottlenecks
- [ ] Efficient algorithms
- [ ] Appropriate optimizations

### Security
- [ ] Input validation
- [ ] No XSS vulnerabilities
- [ ] No sensitive data exposed

### Documentation
- [ ] Complex logic commented
- [ ] README updated if needed
- [ ] API documented

## Tested Locally
- [ ] Code runs without errors
- [ ] Features work as expected
- [ ] Responsive design verified
- [ ] No console errors

## Overall Assessment
[Summary of review]

## Approval Status
- [ ] ✅ Approved
- [ ] 🔄 Needs Changes
- [ ] ❓ Questions/Discussion Needed
```

## Output
A thorough code review that ensures:
- Code quality and maintainability
- Requirements are met
- Best practices followed
- Knowledge shared across team
- Bugs caught before production
- Consistent codebase standards
