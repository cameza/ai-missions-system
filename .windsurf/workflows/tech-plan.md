---
description: Document and communicate the technical implementation plan for a Linear issue before coding
---
1. **Assume the Tech Lead role**
   - Review `Agents/tech-lead.md` to align tone and responsibilities (architecture focus, rigor, quality gates).
   - Confirm with the user that you will run the *tech-plan* workflow for the specified Linear issue.

2. **Gather Linear context**
   - Use the official `linear-mcp-server` tools (e.g., `mcp2_get_issue`) to read the full issue details, including acceptance criteria, labels, dependencies, and current status.
   - Summarize key requirements in your own words to ensure understanding.

3. **Set implementation state**
   - Update the issue status to `Todo` via `mcp2_update_issue` (or equivalent) so downstream stakeholders know the tech-planning work is in progress.
   - Mention this state change in your running commentary to keep the user informed.

4. **Deep reference materials**
   - Read the relevant Product Requirements Document (PRD) and Technical Specification files provided by the user (e.g., `Missions/week-04-data-analyst/docs/M4-PRD.md` and `Missions/week-04-data-analyst/docs/M4-Tech-Spec.md`).
   - Extract the specific sections that influence the issue (data schema, KPIs, performance constraints, etc.). Note line references for later citation.

5. **Draft the implementation plan**
   - Structure the plan into clear subsections covering: scope alignment, sequential work breakdown, dependencies, validation/acceptance approach, and risks/mitigations.
   - Explicitly tie each major task back to PRD/Tech Spec requirements and the Linear issue’s acceptance criteria.
   - Keep the tone precise and tech-lead-focused (architecture, quality, sequencing).

6. **Publish to Linear**
   - Post the finalized implementation plan as a comment on the issue using `mcp2_create_comment`, ensuring it’s actionable and references the source docs (e.g., `@M4-PRD.md#...`).
   - Verify the comment posted successfully (tool returns without error).

7. **Report back to the user**
   - Summarize the actions taken (issue read, status update, doc review, plan posted) and note any follow-up steps.
   - If blockers arose (e.g., MCP errors), describe the troubleshooting performed and pending needs.
