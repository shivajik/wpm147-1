#!/bin/bash

echo "🚀 Deploying WordPress Maintenance Dashboard to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - DATABASE_URL: Your Supabase connection string"
echo "   - NODE_ENV: production"
echo "   - JWT_SECRET: A secure random string"
echo "2. Test debug endpoint: https://your-app.vercel.app/api/debug"
echo "3. Test health check: https://your-app.vercel.app/api/health"
echo "4. Test login with demo credentials:"
echo "   Email: demo@wpmaintenance.com"
echo "   Password: demo123"
echo ""
echo "🔧 If you get HTTP 500 errors, check the troubleshooting guide!"
echo "🎉 Your WordPress maintenance dashboard is now live!"