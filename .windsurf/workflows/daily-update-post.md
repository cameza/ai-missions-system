# Daily Update: Post Workflow

This workflow handles posting drafted daily project updates to Linear using the Linear API integration. It follows the `daily-update: Draft` workflow and publishes the approved update to the project.

## Prerequisites
- Completed daily update draft from `daily-update: Draft` workflow
- **Custom Linear API MCP server** configured and working (NOT official Linear MCP server)
- Access to Linear project with proper permissions
- Approved update content ready for posting

## Step 1: Prepare Update Content (5 minutes)

**Review the drafted update:**
- Verify all completed issues are included
- Check progress calculations are accurate
- Ensure achievement highlights are meaningful
- Confirm next steps are prioritized correctly

**Update content structure:**
```markdown
# [Project Name] - Daily Progress Update

## ✅ COMPLETED Issues Today ([X] tickets)

**[Phase Name]**
- MCS-[XX]: [Issue Title] ✅ DONE
- MCS-[XX]: [Issue Title] ✅ DONE

## 📈 Progress Summary

**Completed Today: [X]/[Total] tickets ([X]%)**
**Overall Progress: [Completed]/[Total] tickets ([X]%)**

## 🚀 Achievement Highlights

- **[Key Achievement 1]**: [Description]
- **[Key Achievement 2]**: [Description]

## 🎯 Next Steps

- MCS-[XX]: [Next Priority Issue]
- MCS-[XX]: [Second Priority Issue]

## 📊 TPM Assessment

**Velocity**: [Assessment]
**Critical Path**: [Current critical path items]
**Risk**: [Any identified risks or blockers]
**Timeline**: [Timeline assessment]

**Recommendation**: [Actionable recommendation]
```

## Step 2: Determine Project Health Status (3 minutes)

**Assess project health based on today's progress:**

### Health Status Guidelines:

**onTrack** (Green):
- ✅ Completed expected number of tickets
- ✅ No blockers or critical issues
- ✅ Timeline on schedule
- ✅ Quality standards met

**atRisk** (Yellow):
- ⚠️ Below expected velocity
- ⚠️ Minor blockers identified
- ⚠️ Timeline concerns
- ⚠️ Quality issues needing attention

**offTrack** (Red):
- 🚫 Significant delays
- 🚫 Major blockers
- 🚫 Timeline at risk
- 🚫 Critical quality issues

**Decision Matrix:**
```
Progress % | Health Status
-----------|--------------
> 80%      | onTrack
60-80%     | onTrack (if quality good)
40-60%     | atRisk
< 40%      | offTrack
```

## Step 3: Post Update to Linear (2 minutes)

**Use Custom Linear API MCP server to create project update:**

```bash
# MCP tool call format (NOT natural language)
mcp1_create_project_update
  projectId: "8fefdb2a-c7e6-48ed-95e2-f8a1d848c5dc"
  body: "[Your markdown content here]"
  health: "onTrack"  # Optional: onTrack, atRisk, offTrack
```

**For Week 1 Resolution Tracker:**
```bash
mcp1_create_project_update
  projectId: "8fefdb2a-c7e6-48ed-95e2-f8a1d848c5dc"
  health: "onTrack"
  body: "# Week 1 Resolution Tracker - Daily Progress Update

## ✅ COMPLETED Issues Today (4 tickets)

**Phase 3: Core Features**
- MCS-61: Feature: Mission Card Component ✅ DONE
- MCS-62: Feature: Mission Creation & Edit Form ✅ DONE
- MCS-63: Feature: Progress Logging with Timeline ✅ DONE
- MCS-64: Feature: Dashboard View with Mission Grid ✅ DONE

## 📈 Progress Summary

**Completed Today: 4/21 tickets (19%)**
**Overall Progress: 12/21 tickets (57%)**

## 🚀 Achievement Highlights

- **Major Feature Completion**: All 4 core feature components implemented today
- **Full User Flow**: Mission creation, viewing, progress tracking, and dashboard complete
- **Component Integration**: Successfully integrated all UI components into working features
- **Mission Management**: End-to-end mission lifecycle now functional

## 🎯 Next Steps

- MCS-65: Mission Detail View (final core feature)
- MCS-67: Mobile Responsiveness Enhancement
- MCS-68: Error Handling & User Feedback

## 📊 TPM Assessment

**Velocity**: Excellent progress - completed 4 major feature tickets today
**Critical Path**: Mission Detail View (MCS-65) is the last remaining core feature
**Risk**: No blockers - foundation is solid and ready for final features
**Timeline**: Significantly ahead of schedule - 57% of project complete

**Recommendation**: Focus on completing the final core feature (Mission Detail View) to achieve full MVP functionality. The project is in excellent position with strong foundation and nearly complete feature set."
```

## Step 4: Verify Update Posted (2 minutes)

**Confirmation checks:**
- [ ] Update appears in Linear project timeline
- [ ] Content formatting is correct
- [ ] Health status is properly set
- [ ] All sections are visible
- [ ] Links and formatting work properly

**Manual verification:**
1. Navigate to Linear project: https://linear.app/themcs/project/[project-id]
2. Check Updates tab
3. Verify latest update content
4. Confirm health status indicator

## Step 5: Archive and Document (3 minutes)

**Archive the update:**
- Save copy to project documentation
- Update internal progress trackers
- Note any important decisions or action items
- Update stakeholder communications if needed

**Documentation locations:**
- Project README updates section
- Internal team documentation
- Stakeholder summary emails
- Project dashboard updates

## Automation Script Example

**For automated posting:**

```typescript
// Script to post daily update to Linear
async function postDailyUpdate(updateContent: string, healthStatus: string) {
  try {
    // Post to Linear using Custom MCP API server
    const result = await mcp1_create_project_update({
      projectId: "8fefdb2a-c7e6-48ed-95e2-f8a1d848c5dc", // Week 1 Resolution Tracker
      body: updateContent,
      health: healthStatus
    });
    
    console.log("✅ Update posted successfully:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Failed to post update:", error);
    throw error;
  }
}

// Usage
const updateContent = generateDailyUpdate(); // From draft workflow
const healthStatus = assessProjectHealth(); // Based on progress
await postDailyUpdate(updateContent, healthStatus);
```

## Project Information Reference

**Week 1 Resolution Tracker:**
- **Project Name**: Mission 1: Resolution Tracker
- **Project ID**: `8fefdb2a-c7e6-48ed-95e2-f8a1d848c5dc`
- **Team**: TheMCs
- **Team ID**: `37fafead-f20a-4801-b779-14ab17b79931`

**Health Status Options:**
- `onTrack` - Project progressing as expected
- `atRisk` - Project has concerns/blockers  
- `offTrack` - Project significantly behind

## Troubleshooting

**Common Issues:**

### 1. MCP Server Not Available
**Problem**: Linear API tools not showing
**Solution**: 
- Check MCP config: `cat "/Users/camilomeza/.codeium/windsurf/mcp_config.json"`
- Restart Windsurf completely
- Verify linear-api-mcp-server is running

### 2. Authentication Errors
**Problem**: "Invalid API key" or permission errors
**Solution**:
- Verify LINEAR_API_KEY in environment
- Check API key permissions in Linear Settings
- Ensure team membership for target project

### 3. Project Not Found
**Problem**: "Project not found" errors
**Solution**:
- Verify project ID: `8fefdb2a-c7e6-48ed-95e2-f8a1d848c5dc`
- Check team membership permissions
- Confirm project exists and is accessible

### 4. Health Status Errors
**Problem**: "Invalid health status" errors
**Solution**:
- Use exact values: `onTrack`, `atRisk`, `offTrack`
- Case-sensitive matching required
- Include health parameter in command

### 5. Content Formatting Issues
**Problem**: Markdown not rendering properly
**Solution**:
- Use proper markdown syntax
- Escape special characters if needed
- Test formatting in Linear preview first

## Quality Assurance

**Pre-posting checklist:**
- [ ] Update content reviewed and approved
- [ ] Progress metrics verified
- [ ] Health status appropriately assessed
- [ ] No sensitive information included
- [ ] Professional tone maintained
- [ ] Action items clearly identified

**Post-posting verification:**
- [ ] Update appears in Linear timeline
- [ ] Health status indicator correct
- [ ] All sections render properly
- [ ] Links and formatting work
- [ ] Stakeholders can access update

## Integration with Other Workflows

**Workflow sequence:**
1. `daily-update: Draft` - Create update content
2. `daily-update: Post` - Publish to Linear (this workflow)
3. `stakeholder-notify` - Send summaries to stakeholders
4. `team-retrospective` - Discuss progress in team meeting

**Automation opportunities:**
- Schedule automatic posting at specific times
- Integrate with CI/CD pipelines
- Trigger on issue completion events
- Sync with project management tools

## Best Practices

**Content Guidelines:**
- Keep updates concise and focused
- Use consistent formatting and terminology
- Highlight achievements and blockers clearly
- Provide actionable next steps

**Timing Guidelines:**
- Post at end of business day
- Include all work completed during the day
- Consider timezone differences for distributed teams
- Maintain regular posting schedule

**Communication Guidelines:**
- Tag relevant team members when needed
- Use appropriate health status to signal issues
- Include links to relevant tickets or documents
- Maintain professional and constructive tone

---

**Workflow Duration:** 15-20 minutes
**Frequency:** Daily (after draft workflow)
**Owner:** TPM or Project Manager
**Required Tools**: **Custom Linear API MCP server** (linear-api), Linear project access
**Dependencies**: `daily-update: Draft` workflow completion
