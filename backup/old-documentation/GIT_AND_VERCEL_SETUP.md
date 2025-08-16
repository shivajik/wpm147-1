# Git & Vercel Deployment Guide

## Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: WordPress Maintenance Dashboard with 2-column layout and selective updates"
```

## Step 2: Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:

#### Build Settings:
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

#### Environment Variables:
Add these environment variables in Vercel dashboard:
```
DATABASE_URL=your_postgresql_database_url
NODE_ENV=production
```

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name: wp-maintenance-dashboard
# - Directory: ./
```

## Step 4: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Name | Value | Description |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your PostgreSQL connection string |
| `NODE_ENV` | `production` | Production environment |

## Step 5: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Important Notes for Vercel Deployment

### ⚠️ Full-Stack Application Considerations

This application is a full-stack Express.js app. The current `vercel.json` configuration attempts to handle both frontend and backend, but there are limitations:

1. **Database Connections**: Ensure your PostgreSQL database is accessible from Vercel
2. **API Routes**: All `/api/*` routes are handled by the Express server
3. **Static Files**: Frontend is served from `dist/public`

### Alternative Deployment Options

If you experience issues with Vercel, consider these alternatives:

#### Railway.app (Recommended for Full-Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Render.com
1. Connect GitHub repository
2. Create "Web Service"
3. Build Command: `npm run build`
4. Start Command: `npm start`

## Current Project Structure

```
wp-maintenance-dashboard/
├── client/              # React frontend
├── server/              # Express.js backend
├── shared/              # Shared TypeScript types
├── dist/                # Built files (created after build)
│   ├── public/          # Frontend build output
│   └── index.js         # Backend build output
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies and scripts
```

## Build Process

The build process creates:
1. **Frontend Build**: `vite build` → `dist/public/`
2. **Backend Build**: `esbuild` → `dist/index.js`

## Troubleshooting

### Issue: "Code page" showing instead of app
**Solution**: Check that build completed successfully and `dist/public/index.html` exists

### Issue: API routes not working
**Solution**: Verify `vercel.json` routes configuration and DATABASE_URL environment variable

### Issue: Build failures
**Solution**: Ensure all dependencies are in `package.json` and build runs locally with `npm run build`

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Environment variables configured
- [ ] Build command set to `npm run build`
- [ ] Output directory set to `dist/public`
- [ ] Database accessible from Vercel
- [ ] Custom domain configured (optional)

## Post-Deployment

After successful deployment:
1. Test all functionality including WordPress data fetching
2. Verify database connections work
3. Check that all routes respond correctly
4. Monitor Vercel function logs for any errors

Your application will be available at: `https://your-project-name.vercel.app`