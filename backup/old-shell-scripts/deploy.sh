#!/bin/bash

# WordPress Maintenance Dashboard - Deployment Script
echo "🚀 Starting deployment setup for WordPress Maintenance Dashboard..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files
echo "📦 Adding files to Git..."
git add .

# Create commit
echo "💾 Creating commit..."
git commit -m "WordPress Maintenance Dashboard with 2-column layout and selective updates

Features:
- ManageWP-inspired dashboard layout
- 2-column responsive design for optimal space utilization
- Tabbed Updates section (Plugins, Themes, WordPress)
- Selective update management with checkboxes
- Enhanced backup management with statistics
- Analytics dashboard with visitor metrics
- Professional UI with glass effects and animations
- Real WordPress data integration via Worker Plugin API
- Subscription management system with Stripe integration
- User profile management and security settings"

echo "✅ Commit created"

# Check if remote exists
if git remote -v | grep -q "origin"; then
    echo "⚠️  Remote 'origin' already exists. Skipping remote setup."
    echo "📋 Current remotes:"
    git remote -v
else
    echo "🔗 Please set up your GitHub repository:"
    echo "1. Create a new repository on GitHub"
    echo "2. Copy the repository URL"
    echo "3. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "4. Run: git push -u origin main"
fi

echo ""
echo "🌐 Next Steps for Vercel Deployment:"
echo "1. Push to GitHub: git push -u origin main"
echo "2. Go to vercel.com and import your repository"
echo "3. Set Build Command: npm run build"
echo "4. Set Output Directory: dist/public"
echo "5. Add Environment Variables:"
echo "   - DATABASE_URL=your_postgresql_url"
echo "   - NODE_ENV=production"
echo ""
echo "📖 For detailed instructions, see GIT_AND_VERCEL_SETUP.md"
echo "🎉 Deployment setup complete!"