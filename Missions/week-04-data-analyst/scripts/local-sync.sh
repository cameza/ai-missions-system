#!/bin/bash

# Local Transfermarkt Sync Script
# Runs every 4 hours to scrape fresh data and update Supabase

set -e  # Exit on error

echo "🔄 Starting Transfermarkt sync at $(date)"

# Navigate to project directory
cd "$(dirname "$0")/.."

# Step 1: Scrape fresh Transfermarkt data
echo "📊 Scraping Transfermarkt..."
npx tsx scripts/transfermarkt-scrape.ts

# Step 2: Copy fresh data to expected location
echo "📋 Copying fresh data..."
cp tmp/latest-transfers-pages-1-to-3.csv Temp_Ref/latest-transfers-top10-pages-1-to-10.csv

# Step 3: Seed database with fresh data
echo "🌱 Seeding Supabase..."
NEXT_PUBLIC_SUPABASE_URL=https://udcjucbickfosbhcpwqq.supabase.co \
SUPABASE_URL=https://udcjucbickfosbhcpwqq.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=sb_secret_jY8DCnx4moaDTMum3u-4Pg_sctvbBKM \
API_FOOTBALL_KEY=0ff4c3d70afd7872a63951cafb27cbc8 \
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io \
npm run seed

echo "✅ Transfermarkt sync completed at $(date)"
echo "📈 Fresh data available in Supabase"
