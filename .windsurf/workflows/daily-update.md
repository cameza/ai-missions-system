# Daily Update Workflow

**Server Required**: Official Linear MCP Server (linear-mcp-server) - `mcp2_*` tools
**Purpose**: Read issues and data from Linear (READ operations)

This workflow automates the process of generating daily project progress updates by fetching completed issues from Linear and formatting them into a structured update.

## Prerequisites
- Access to Linear workspace with MCP integration
- Linear project with proper issue tracking and phases
- Understanding of project phases and ticket structure
- TPM role or project management responsibilities

## Step 1: Fetch Today's Completed Issues (5 minutes)

**Use Linear MCP to get completed issues:**
```bash
# Get issues completed today (last 24 hours)
mcp2_list_issues --project "Mission 1: Resolution Tracker" --state "Done" --updatedAt "-P1D"
```

**Filter results:**
- Only include issues with `updatedAt` timestamp from today
- Exclude issues completed on previous days
- Group by phase/feature area

## Step 2: Analyze Progress Data (5 minutes)

**Count completed issues by phase:**
- Phase 0: Setup
- Phase 1: Foundation  
- Phase 2: Shared Components
- Phase 3: Core Features
- Phase 4: Polish & Enhancement
- Phase 5: Quality & Deployment

**Calculate progress metrics:**
- Total issues completed today
- Overall project completion percentage
- Phase completion percentages
- Velocity assessment

## Step 3: Generate Update Template (10 minutes)

**Use the following template structure:**

```markdown
# [Project Name] - Daily Progress Update

## ✅ COMPLETED Issues Today ([X] tickets)

**[Phase Name]**
- MCS-[XX]: [Issue Title] ✅ DONE
- MCS-[XX]: [Issue Title] ✅ DONE

## 📈 Progress Summary

**Completed Today: [X]/[Total] tickets ([X]%)**
**Overall Progress: [Completed]/[Total] tickets ([X]%)**

- [Phase 1]: [X]/[Y] complete ✅
- [Phase 2]: [X]/[Y] complete ✅
- Remaining work: [X] tickets pending

## 🚀 Achievement Highlights

- **[Key Achievement 1]**: [Description]
- **[Key Achievement 2]**: [Description]
- **[Key Achievement 3]**: [Description]
- **[Key Achievement 4]**: [Description]

## 🎯 Next Steps

- MCS-[XX]: [Next Priority Issue]
- MCS-[XX]: [Second Priority Issue]
- MCS-[XX]: [Third Priority Issue]

## 📊 TPM Assessment

**Velocity**: [Assessment of today's progress]
**Critical Path**: [Current critical path items]
**Risk**: [Any identified risks or blockers]
**Timeline**: [Timeline assessment and schedule status]

**Recommendation**: [Actionable recommendation for next steps]
```

## Step 4: Customize Content (10 minutes)

**Fill in template sections:**

**Achievement Highlights:**
- Focus on major milestones reached
- Highlight integration achievements
- Note completion of significant features
- Mention foundation work that enables future progress

**Next Steps:**
- Prioritize critical path items
- Focus on blocking dependencies
- Consider upcoming phase transitions
- Address any identified risks

**TPM Assessment:**
- Evaluate velocity against expectations
- Identify any schedule impacts
- Note resource allocation needs
- Provide strategic recommendations

## Step 5: Review and Finalize (5 minutes)

**Quality checks:**
- [ ] All completed issues from today are included
- [ ] Progress calculations are accurate
- [ ] Phase groupings are correct
- [ ] Achievement highlights are meaningful
- [ ] Next steps are prioritized correctly
- [ ] TPM assessment is actionable

**Final review:**
- Check for consistent formatting
- Verify ticket numbers and titles
- Ensure percentage calculations are correct
- Validate phase completion status

## Automation Script Example

**For automated execution, use this script structure:**

```typescript
// Script to fetch daily completed issues and generate update
async function generateDailyUpdate() {
  // 1. Fetch today's completed issues
  const completedIssues = await mcp2_list_issues({
    project: "Mission 1: Resolution Tracker",
    state: "Done",
    updatedAt: "-P1D"
  });
  
  // 2. Group by phase
  const issuesByPhase = groupByPhase(completedIssues);
  
  // 3. Calculate metrics
  const metrics = calculateProgressMetrics(completedIssues);
  
  // 4. Generate update
  const update = generateUpdateTemplate(issuesByPhase, metrics);
  
  // 5. Return formatted update
  return update;
}
```

## Best Practices

**Content Guidelines:**
- Keep updates concise and focused on progress
- Use consistent formatting and terminology
- Highlight achievements that move the project forward
- Provide actionable next steps and recommendations

**Timing:**
- Run workflow at end of each workday
- Include all issues completed during business hours
- Consider timezone differences for distributed teams

**Quality Assurance:**
- Double-check issue completion dates
- Verify phase classifications are correct
- Ensure progress metrics are accurate
- Review for clarity and professionalism

## Template Customization

**Project-specific adjustments:**
- Update project name in title
- Adjust phase names to match your project structure
- Modify achievement highlight categories
- Customize TPM assessment criteria

**Styling options:**
- Add project-specific branding elements
- Include team mentions or acknowledgments
- Add links to relevant documentation
- Include stakeholder-specific information

## Integration Options

**Linear Integration:**
- Use Linear webhooks for real-time updates
- Schedule automated runs at specific times
- Integrate with Linear cycle tracking
- Connect to Linear team milestones

**Communication Channels:**
- Post updates to Slack/Discord
- Send email summaries to stakeholders
- Update project dashboards
- Archive in project documentation

## Troubleshooting

**Common Issues:**
- Missing issues: Check date range filters
- Incorrect metrics: Verify total ticket count
- Phase errors: Ensure proper labeling in Linear
- Format issues: Check markdown syntax

**Data Validation:**
- Cross-check with Linear UI
- Verify issue completion timestamps
- Confirm project phase definitions
- Test with sample data

## Usage Examples

**Daily Standup Update:**
```
Completed 4 core feature tickets today, achieving 57% overall project completion. 
Major achievement: Full mission management flow is now functional. 
Next priority: Complete final core feature (Mission Detail View).
```

**Stakeholder Summary:**
```
Excellent progress today with 4 major features completed. 
The project is significantly ahead of schedule with strong foundation and nearly complete feature set. 
No blockers identified - ready to complete final MVP features.
```

**Team Retrospective:**
```
Outstanding velocity completing 4 feature tickets. 
Successful integration of all UI components into working features. 
Recommend focusing on Mission Detail View to achieve full MVP functionality.
```

---

**Workflow Duration:** 25-35 minutes
**Frequency:** Daily (end of business day)
**Owner:** TPM or Project Manager
**Required Tools:** Linear MCP, Markdown editor
