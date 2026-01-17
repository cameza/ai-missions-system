# Linear API Integration Usage Guide

## Overview
This guide documents the Linear API integration setup and usage for creating project updates and managing Linear workspace operations via MCP (Model Context Protocol).

## 🚀 Quick Setup Summary

### What Was Configured
- ✅ **Custom Linear API MCP Server** - Created separate from official Linear MCP server
- ✅ **Write Operations** - Full CRUD access to Linear projects and issues
- ✅ **Project Updates** - Native Linear project update functionality
- ✅ **Authentication** - Linear API key integration

### Server Location
```
/Users/camilomeza/Documents/Personal Documents/Personal Projects/linear-api-mcp-server/
```

## 📋 MCP Configuration

### MCP Config File Location
```
/Users/camilomeza/.codeium/windsurf/mcp_config.json
```

### Configuration Added
```json
{
  "mcpServers": {
    "linear-api": {
      "command": "node",
      "args": [
        "/Users/camilomeza/Documents/Personal Documents/Personal Projects/linear-api-mcp-server/index.js"
      ],
      "env": {
        "LINEAR_API_KEY": "YOUR_LINEAR_API_KEY_HERE"
      }
    }
  }
}
```

## 🔧 Available Tools

### Project Management
| Tool | Purpose | Example |
|------|---------|---------|
| `list_projects` | List all projects in workspace | Search and discover projects |
| `get_project` | Retrieve project details | Full project information with issues and updates |
| `create_project` | Create new project | Set up new projects with team and settings |
| `update_project` | Update project properties | Name, description, status |
| `create_project_update` | Create project updates | Primary tool for progress tracking |
| `list_project_labels` | List project labels | Available labels for organization |

### Issue Management
| Tool | Purpose | Example |
|------|---------|---------|
| `list_issues` | List issues with filters | Find issues by assignee, project, team, state |
| `get_issue` | Retrieve detailed issue info | Include attachments, branch name, comments |
| `create_issue` | Create new issues | Feature requests, bugs |
| `update_issue` | Update existing issues | Status, assignee, priority |
| `create_comment` | Add comments to issues | Discussion, updates |
| `list_comments` | Get all comments for an issue | Review conversation history |

### Issue Status & Labels
| Tool | Purpose | Example |
|------|---------|---------|
| `list_issue_statuses` | List available statuses | Workflow states for a team |
| `get_issue_status` | Get specific status details | Status properties and description |
| `list_issue_labels` | List available labels | Organization labels |
| `create_issue_label` | Create new labels | Custom labeling system |

## 🔍 Search & Discovery Commands

### Finding Projects
```
List all projects to discover what's available:
Use list_projects to browse the workspace and find project IDs for detailed operations.
```

### Finding Issues  
```
List issues with various filters:
- Use "me" as assigneeId to get your assigned issues
- Filter by projectId to see project-specific issues
- Filter by teamId to focus on specific teams
- Use stateId to see issues in particular workflow states
```

### Getting Detailed Information
```
Once you find projects/issues, use:
- get_project with project ID for full details
- get_issue with issue ID for complete information including attachments
```

## 📄 Document Content vs Description

### Critical Distinction

Linear projects have **two different content fields**:

#### `description` (String)
- Brief summary text (1-2 sentences)
- Simple string field
- Used for quick project overviews
- Example: "Find or create a dataset relevant to your interests and use AI tools to analyze it. Generate visualizations and identify patterns."

#### `documentContent` (DocumentContent)
- Full rich document content (can be 50,000+ characters)
- Contains complete PRDs, specifications, detailed documentation
- Structured content with proper formatting
- **This is where the actual project content lives**

### GraphQL Schema
```graphql
type Project {
  id: String!
  name: String!
  description: String!           # Brief summary
  documentContent: DocumentContent  # Full document content
}

type DocumentContent {
  id: String!
  content: String!             # Full document text
}
```

### Query Examples

#### Basic Project Info (description only)
```graphql
query GetProject($id: String!) {
  project(id: $id) {
    id
    name
    description
    url
    state
  }
}
```

#### Full Document Content
```graphql
query GetProjectDocument($id: String!) {
  project(id: $id) {
    id
    name
    description
    documentContent {
      id
      content
    }
  }
}
```

### Real-World Example

**Mission 4: Data Analyst Project:**
- **Project ID**: `4aa97283-d42e-4ad3-9798-9ec0543fd554`
- **Description**: "Find or create a dataset relevant to your interests and use AI tools to analyze it. Generate visualizations and identify patterns."
- **DocumentContent**: 55,520 characters containing full Transfer Hub PRD

## 🔧 Practical API Usage

### Direct API Access (Node.js)

When MCP tools aren't available, you can access the Linear API directly:

```javascript
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const LINEAR_API_URL = 'https://api.linear.app/graphql';

async function makeGraphQLRequest(query, variables = {}) {
  const response = await fetch(LINEAR_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.LINEAR_API_KEY,  // Direct key, not Bearer
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors.map(e => e.message).join(', '));
  }

  return result.data;
}
```

### Working Examples

#### 1. List All Projects
```javascript
const query = `
  query {
    projects(first: 50) {
      nodes {
        id
        name
        description
        url
        state
      }
    }
  }
`;

const result = await makeGraphQLRequest(query);
const projects = result.projects.nodes;
```

#### 2. Find Specific Project
```javascript
const query = `
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      description
      documentContent {
        id
        content
      }
    }
  }
`;

const result = await makeGraphQLRequest(query, { 
  id: '4aa97283-d42e-4ad3-9798-9ec0543fd554' 
});
```

#### 3. Search for Project by Name
```javascript
// First list all projects, then filter
const projects = await makeGraphQLRequest(projectsQuery);
const mission4Project = projects.projects.nodes.find(p => 
  p.name.toLowerCase().includes('mission 4') && 
  p.name.toLowerCase().includes('data analyst')
);
```

### Error Handling Patterns

#### GraphQL Validation Errors
```javascript
try {
  const result = await makeGraphQLRequest(query, variables);
  return result;
} catch (error) {
  if (error.message.includes('GRAPHQL_VALIDATION_FAILED')) {
    console.error('GraphQL query error:', error.message);
    // Fix query structure based on error message
  }
  throw error;
}
```

#### Common GraphQL Errors
- `"Cannot query field \"title\" on type \"DocumentContent\"` → Remove invalid field
- `"Field \"content\" must not have a selection since type \"String\" has no subfields` → Query content directly, not as object
- `"Cannot query field \"team\" on type \"Project\"` → Use `teams { nodes { name } }` instead

### Content Extraction

#### Extract Full Document Content
```javascript
const query = `
  query GetProjectDocument($id: String!) {
    project(id: $id) {
      name
      documentContent {
        content
      }
    }
  }
`;

const result = await makeGraphQLRequest(query, { id: projectId });
const fullContent = result.project.documentContent.content;

// Save to file
import fs from 'fs';
fs.writeFileSync('PRD.md', fullContent);
```

## 🎯 Project Update Commands

### Basic Format
```
Create a project update for the "Job Application Tracker" project with the following content:

[Your markdown content here]
```

### With Health Status
```
Create a project update for the "Job Application Tracker" project with health "onTrack" and the following content:

[Your markdown content here]
```

### Health Status Options
- `onTrack` - Project progressing as expected
- `atRisk` - Project has concerns/blockers
- `offTrack` - Project significantly behind

## 📊 Project Information

### Mission 4: Data Analyst Project
- **Project Name**: Mission 4: Data Analyst
- **Project ID**: `4aa97283-d42e-4ad3-9798-9ec0543fd554`
- **Team**: TheMCs
- **Team ID**: `37fafead-f20a-4801-b779-14ab17b79931`
- **Project URL**: https://linear.app/themcs/project/mission-4-data-analyst-b3849e57d232
- **Description**: Find or create a dataset relevant to your interests and use AI tools to analyze it. Generate visualizations and identify patterns.
- **Document Content**: 55,520 characters (Transfer Hub PRD)
- **State**: planned
- **Status**: Planned (planned)
- **Created**: January 9, 2026
- **Updated**: January 16, 2026

## 🔑 Authentication

### Linear API Key
- **Key**: `YOUR_LINEAR_API_KEY_HERE` (Get from Linear Settings > API > Personal API Keys)
- **Source**: Linear Settings > API > Personal API Keys
- **Permissions**: Full access to user's Linear workspace data
- **Environment Variable**: `LINEAR_API_KEY`

### API Authentication Method
```javascript
// Linear API uses direct API key (not Bearer token)
headers: {
  'Authorization': apiKey,  // Direct key, not 'Bearer ${apiKey}'
}
```

## 🛠️ Technical Implementation

### Server Architecture
- **Language**: Node.js with ES modules
- **Framework**: MCP SDK (@modelcontextprotocol/sdk)
- **API**: Linear GraphQL API
- **Transport**: StdioServerTransport

### Key Files
```
linear-api-mcp-server/
├── index.js              # Main MCP server implementation
├── package.json          # Dependencies and scripts
├── test_update.js        # Direct API testing script
├── .env                  # Environment variables (local)
├── PROJECT_UPDATE_GUIDE.md # Detailed usage guide
└── LINEAR_API_USAGE_GUIDE.md # This file
```

### Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "node-fetch": "^3.3.2"
}
```

## 📝 Usage Examples

### Example 1: Weekly Progress Update
```
Create a project update for the "Job Application Tracker" project with health "onTrack" and the following content:

## 🎯 Weekly Progress Summary

### Completed This Week:
- ✅ Fixed email sync issues
- ✅ Updated UI components  
- ✅ Added new features

### Next Week:
- 🔄 Implement AI parsing
- 🔄 Test user workflows
- 🔄 Deploy to staging

### Metrics:
- 📊 85% parsing accuracy achieved
- 📈 72 emails processed successfully
- ⚡ <5s average processing time
```

### Example 2: Blocker Notification
```
Create a project update for the "Job Application Tracker" project with health "atRisk" and the following content:

## ⚠️ Blockers Identified

### Current Issues:
- 🚫 API rate limiting problems
- 🚫 Database performance issues
- 🚫 Third-party service delays

### Mitigation Plan:
- 📋 Implement caching strategy
- 📋 Optimize database queries
- 📋 Add fallback mechanisms

### ETA:
- Expected resolution: 3-5 days
```

### Example 3: Major Milestone
```
Create a project update for the "Job Application Tracker" project with health "onTrack" and the following content:

# 🎉 MVP Complete - Job Application Tracker

## ✅ All Core Features Working
- ✅ AI Email Parsing & Integration
- ✅ Application Tracking & Stages
- ✅ Review Workflow & UI
- ✅ Database & Security

## 🚀 Production Ready
The system is now fully functional for personal job application tracking!

## 📊 Performance Metrics
- 72 emails processed
- 85% parsing accuracy
- Zero data loss

## 🎯 Next Steps
- Enhanced Dashboard visualizations
- Gmail integration
- Mobile app development
```

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. MCP Server Not Available
**Problem**: Tools not showing after restart
**Solution**: 
- Check MCP config file syntax
- Restart Windsurf completely
- Verify server file path exists

#### 2. Authentication Errors
**Problem**: "Invalid API key" errors
**Solution**:
- Verify LINEAR_API_KEY is correct
- Check API key permissions in Linear
- Ensure no Bearer prefix in auth header

#### 3. Project Not Found
**Problem**: "Project not found" errors
**Solution**:
- Verify project ID: `4aa97283-d42e-4ad3-9798-9ec0543fd554` (Mission 4: Data Analyst)
- Check team membership permissions
- Confirm project exists in Linear
- Use list_projects to find correct project ID

#### 4. Health Status Errors
**Problem**: "Invalid health status" errors
**Solution**:
- Use exact values: `onTrack`, `atRisk`, `offTrack`
- Case-sensitive matching required

#### 5. GraphQL Validation Errors
**Problem**: Query structure errors like "Cannot query field" or "must not have a selection"
**Solution**:
- Check GraphQL schema for correct field names
- Use `documentContent { content }` not `documentContent { content { ... } }`
- Use `teams { nodes { name } }` not `team { name }`
- Remove invalid fields like `title` from DocumentContent

#### 6. Empty Document Content
**Problem**: documentContent exists but content is empty
**Solution**:
- Project may not have rich document content
- Check if project was created with document content
- Use description field for basic project info

### Debug Commands

#### Direct API Test
```bash
cd "/Users/camilomeza/Documents/Personal Documents/Personal Projects/linear-api-mcp-server"
node test_update.js
```

#### Check MCP Config
```bash
cat "/Users/camilomeza/.codeium/windsurf/mcp_config.json"
```

#### Verify Server Files
```bash
ls -la "/Users/camilomeza/Documents/Personal Documents/Personal Projects/linear-api-mcp-server/"
```

## 📚 Additional Documentation

### Related Files
- `PROJECT_UPDATE_GUIDE.md` - Detailed project update templates and examples
- `index.js` - MCP server implementation
- `test_update.js` - Direct API testing script

### External Resources
- [Linear API Documentation](https://developers.linear.app/docs/graphql-api)
- [Linear GraphQL Schema](https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference)
- [MCP SDK Documentation](https://modelcontextprotocol.io/)

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Create project updates for progress tracking
- **Monthly**: Review API key usage and permissions
- **Quarterly**: Update MCP server dependencies

### Backup & Recovery
- MCP config backed up to: `mcp_config.json.backup`
- Server code in Git repository
- Linear data backed up by Linear platform

---

## 📞 Support

### For Issues Related To:
- **MCP Server**: Check this guide and troubleshooting section
- **Linear API**: Refer to Linear documentation
- **Authentication**: Verify API key in Linear settings

### Quick Reference Commands
```
# Basic project update
Create a project update for the "Mission 4: Data Analyst" project with the following content:

# With health status
Create a project update for the "Mission 4: Data Analyst" project with health "onTrack" and the following content:

# Available health values: onTrack, atRisk, offTrack
# Mission 4 Project ID: 4aa97283-d42e-4ad3-9798-9ec0543fd554
# Mission 4 URL: https://linear.app/themcs/project/mission-4-data-analyst-b3849e57d232

# Direct API usage
node -e "import('./direct-api-example.js')"  # Use practical examples from guide
```

---

**Last Updated**: January 16, 2026  
**Version**: 2.0.0  
**Status**: ✅ Active and Working  
**Updates**: Added documentContent guidance, GraphQL examples, and Mission 4 project details
