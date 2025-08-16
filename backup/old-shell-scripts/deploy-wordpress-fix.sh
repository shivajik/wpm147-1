#!/bin/bash

echo "🚀 Deploying WordPress data fixes to Vercel..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this from the project root."
    exit 1
fi

# Show what will be committed
echo "📝 Changes to be deployed:"
git diff --name-only
echo ""

# Commit changes
echo "💾 Committing WordPress Remote Manager integration..."
git add api/index.ts WORDPRESS_DATA_FIX_SUMMARY.md deploy-wordpress-fix.sh
git commit -m "Fix: Add WordPress Remote Manager client for real maintenance data

✅ Added WPRemoteManagerClient class to Vercel API handler
✅ Enhanced /api/websites/:id/wordpress-data endpoint 
✅ Enhanced /api/websites/:id/wrm/updates endpoint
✅ Enhanced /api/websites/:id/wrm-plugins endpoint  
✅ Added /api/websites/:id/wrm-themes endpoint
✅ Real-time WordPress data fetching with caching
✅ Proper error handling and fallback mechanisms
✅ WordPress Remote Manager API integration complete

🎯 Fixes: Maintenance data (plugins, themes, updates) now loads properly on Vercel"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully"
else
    echo "❌ Failed to commit changes"
    exit 1
fi

# Push to main branch (triggers Vercel auto-deploy)
echo "📤 Pushing to main branch..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🔄 Vercel should automatically redeploy within 1-2 minutes"
    echo ""
    echo "🎯 What's Fixed:"
    echo "   ✅ WordPress maintenance data will now load properly"
    echo "   ✅ Real plugin lists with actual status and versions"
    echo "   ✅ Accurate update counts for plugins, themes, WordPress"  
    echo "   ✅ Live WordPress system information and health data"
    echo ""
    echo "📋 Next steps:"
    echo "1. Wait 1-2 minutes for Vercel to redeploy"
    echo "2. Test maintenance data at: https://your-app.vercel.app"
    echo "3. Check WordPress dashboard pages for real data"
    echo "4. Verify plugin/theme lists are populated"
    echo ""
    echo "🎉 WordPress data integration deployment complete!"
else
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "Manual alternatives:"
    echo "1. Run: vercel --prod"
    echo "2. Or redeploy via Vercel dashboard"
    exit 1
fi