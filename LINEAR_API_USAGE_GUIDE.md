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
| `create_project_update` | Create project updates | Primary tool for progress tracking |
| `update_project` | Update project properties | Name, description, status |
| `get_project` | Retrieve project details | Project information |

### Issue Management
| Tool | Purpose | Example |
|------|---------|---------|
| `create_issue` | Create new issues | Feature requests, bugs |
| `update_issue` | Update existing issues | Status, assignee, priority |
| `create_comment` | Add comments to issues | Discussion, updates |

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

### Job Application Tracker Project
- **Project Name**: Job Application Tracker
- **Project ID**: `4fe78c18-8a9b-4bc6-9893-bd5cac17aa01`
- **Team**: TheMCs
- **Team ID**: `37fafead-f20a-4801-b779-14ab17b79931`
- **Project URL**: https://linear.app/themcs/project/job-application-tracker-94cdd9e894cf

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
- Verify project ID: `4fe78c18-8a9b-4bc6-9893-bd5cac17aa01`
- Check team membership permissions
- Confirm project exists in Linear

#### 4. Health Status Errors
**Problem**: "Invalid health status" errors
**Solution**:
- Use exact values: `onTrack`, `atRisk`, `offTrack`
- Case-sensitive matching required

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
# Basic update
Create a project update for the "Job Application Tracker" project with the following content:

# With health
Create a project update for the "Job Application Tracker" project with health "onTrack" and the following content:

# Available health values: onTrack, atRisk, offTrack
# Project ID: 4fe78c18-8a9b-4bc6-9893-bd5cac17aa01
```

---

**Last Updated**: January 3, 2026  
**Version**: 1.0.0  
**Status**: ✅ Active and Working
