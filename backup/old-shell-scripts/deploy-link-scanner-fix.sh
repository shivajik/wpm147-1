#!/bin/bash

echo "🚀 Deploying Enhanced Link Scanner to Vercel..."
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run this from the project root."
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git diff --cached --name-only)" ] || [ -n "$(git diff --name-only)" ]; then
    echo "📝 Committing enhanced link scanner changes..."
    git add .
    git commit -m "feat: Add enhanced Vercel-compatible broken link scanner

- Added VercelLinkScanner class optimized for serverless constraints
- Implemented real broken link detection with HTML parsing using cheerio
- Enhanced API endpoints with comprehensive error handling and timeout management
- Optimized for Vercel with 5-second timeouts and limited concurrent processing
- Added proper URL resolution, link categorization, and status code checking
- Fixed Vercel deployment compatibility for broken link monitoring functionality"
    
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
    echo "2. Test the link monitor at: https://your-app.vercel.app/websites/7/link-monitor"
    echo "3. Check debug endpoint: https://your-app.vercel.app/api/debug"
    echo "4. Verify link scanning works with 'Start First Scan' button"
    echo ""
    echo "🔧 Enhanced Features Available After Deployment:"
    echo "   - Real broken link detection (not just homepage check)"
    echo "   - HTML parsing with cheerio for comprehensive link extraction"
    echo "   - Vercel-optimized timeouts and concurrency limits"
    echo "   - Proper error handling and database persistence"
    echo "   - Link categorization (internal, external, images)"
    echo ""
    echo "🎉 Deployment initiated successfully!"
else
    echo "❌ Failed to push to GitHub"
    echo ""
    echo "Manual alternatives:"
    echo "1. Run: npm run build && vercel --prod"
    echo "2. Or redeploy via Vercel dashboard"
    exit 1
fi