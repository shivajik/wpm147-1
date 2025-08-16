#!/bin/bash

echo "🚀 Deploying API endpoint fixes to Vercel..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this from the project root."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git diff --cached --name-only)" ] || [ -n "$(git diff --name-only)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "Fix: Add missing sync and test-connection API endpoints for Vercel

- Added POST /api/websites/:id/sync endpoint to api/index.ts
- Added POST /api/websites/:id/test-connection endpoint to api/index.ts  
- Improved endpoint pattern matching with regex
- Added comprehensive debugging and logging
- Fixed API endpoint not found errors on Vercel deployment"
    
    if [ $? -eq 0 ]; then
        echo "✅ Changes committed successfully"
    else
        echo "❌ Failed to commit changes"
        exit 1
    fi
else
    echo "ℹ️  No uncommitted changes found"
fi

# Push to main branch (triggers Vercel auto-deploy)
echo "📤 Pushing to main branch..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🔄 Vercel should automatically redeploy within 1-2 minutes"
    echo ""
    echo "📋 Next steps:"
    echo "1. Wait 1-2 minutes for Vercel to redeploy"
    echo "2. Test the sync button at: https://your-app.vercel.app"
    echo "3. Check debug endpoint: https://your-app.vercel.app/api/debug"
    echo "4. Verify endpoints are now available"
    echo ""
    echo "🎉 Deployment initiated successfully!"
else
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "Manual alternatives:"
    echo "1. Run: vercel --prod"
    echo "2. Or redeploy via Vercel dashboard"
    exit 1
fi