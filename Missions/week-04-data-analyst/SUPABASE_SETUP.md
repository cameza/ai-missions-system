# Supabase Setup Guide - Transfer Hub

## Overview
The Transfer Hub dashboard requires Supabase for data storage and API functionality. This guide will help you set up Supabase and configure the environment variables.

## 🚀 Quick Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Choose your organization or create a new one
5. Name your project (e.g., "transfer-hub")
6. Set a database password (save this securely!)

### 2. Get Your Credentials
Once your project is created, you'll need:

**Project URL**: `https://[project-id].supabase.co`
**Service Role Key**: Found in Project Settings → API → service_role (eyJ...)

### 3. Configure Environment Variables
Update your `.env.local` file with your actual credentials:

```bash
# API-Football Configuration
API_FOOTBALL_KEY=0ff4c3d70afd7872a63951cafb27cbc8
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Supabase Configuration - UPDATE THESE
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supababase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here

# Sync API Security (Optional - for production)
SYNC_API_KEY=your_sync_api_key_here

# Error Monitoring & Alerting (Optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
ERROR_WEBHOOK_URL=your_error_webhook_url_here

# Development/Testing
NODE_ENV=development
```

### 4. Database Setup (Optional)
The dashboard includes mock data and will work without database setup. For full functionality:

1. **Create Tables**: The application will create tables automatically via migrations
2. **Sample Data**: Mock data is provided for development and testing

## 📋 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key for server-side operations |
| `API_FOOTBALL_KEY` | ✅ | API-Football API key (already configured) |
| `API_FOOTBALL_BASE_URL` | ✅ | API-Football base URL (already configured) |

## 🧪 Testing Without Supabase

The application includes comprehensive mock data and will work immediately without Supabase configuration:

- **Mock Transfers**: Sample transfer data with realistic values
- **Mock Summary**: KPI card statistics
- **Mock Top Transfers**: Sidebar transfer rankings
- **Graceful Degradation**: Falls back to mock data if Supabase is unavailable

## 🔧 Troubleshooting

### "supabaseUrl is required" Error
This means your environment variables aren't configured properly:

1. Check that `.env.local` exists in the project root
2. Verify the variable names match exactly
3. Ensure the values are not the placeholder text
4. Restart the development server after changes

### Development Server Not Starting
1. Check for syntax errors in `.env.local`
2. Ensure all required variables are present
3. Verify no extra spaces or special characters

### Database Connection Issues
1. Verify your Supabase project is active
2. Check that the service role key is correct
3. Ensure the project URL matches your Supabase project

## 📚 Next Steps

Once Supabase is configured:

1. **Real Data**: The dashboard will fetch real transfer data
2. **API Endpoints**: All API routes will connect to your database
3. **Data Sync**: Automated data sync from API-Football
4. **Full Functionality**: All features will work with live data

## 🛡️ Security Notes

- **Never commit** `.env.local` to version control
- **Service Role Key** has admin access - keep it secure
- **Public URL** can be shared safely
- Consider using environment-specific files for different environments

## 📞 Support

If you encounter issues:

1. Check the browser console for specific error messages
2. Verify your Supabase project is active and accessible
3. Ensure all environment variables are properly formatted
4. Restart the development server after making changes

---

**Note**: The dashboard is designed to work with or without Supabase. Mock data provides a complete development experience while you set up your database.
