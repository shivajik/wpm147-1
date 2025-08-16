# Vercel Redeploy Guide - Fix API Endpoints

## Issue
The sync and test-connection endpoints are showing "API endpoint not found" because Vercel is running old code without the updated API handler.

## Solution: Redeploy to Vercel

### Option 1: Automatic Redeploy (Recommended)
If your Vercel project is connected to GitHub:

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix: Add missing sync and test-connection API endpoints"
   git push origin main
   ```

2. **Vercel will automatically redeploy** within 1-2 minutes

### Option 2: Manual Redeploy via Vercel CLI
```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login

# Redeploy the project
vercel --prod
```

### Option 3: Redeploy via Vercel Dashboard
1. Go to your Vercel dashboard
2. Find your project (wpm-e0m8uq7e9-shivajis-projects-560440d4)
3. Click on the project
4. Go to "Deployments" tab
5. Click "Redeploy" on the latest deployment

## Verification Steps

After redeploying, test these endpoints:

### 1. Check Debug Endpoint
Visit: `https://your-app.vercel.app/api/debug`

Should show `availableEndpoints` including:
- `POST /api/websites/:id/sync`
- `POST /api/websites/:id/test-connection`

### 2. Test Sync Button
- Go to your website detail page
- Click "Sync Now" button
- Should show "Sync Successful" instead of "API endpoint not found"

### 3. Test Connection Button
- Click "Test Connection" button
- Should show "Connection Successful" instead of "API endpoint not found"

## Updated Endpoints Added

The following endpoints have been added to `api/index.ts`:

```typescript
// WordPress sync endpoint
POST /api/websites/:id/sync

// WordPress test connection endpoint  
POST /api/websites/:id/test-connection
```

## Troubleshooting

If still getting errors after redeploy:

1. **Clear Vercel function cache:**
   - In Vercel dashboard → Project → Settings → Functions
   - Clear cache and redeploy

2. **Check Vercel function logs:**
   - Go to Vercel dashboard → Project → Functions
   - Click on `/api/index` function
   - Check "Invocations" tab for error logs

3. **Verify environment variables:**
   - Ensure `DATABASE_URL`, `NODE_ENV`, and `JWT_SECRET` are set in Vercel

## Expected Result
After successful redeploy, both "Sync Now" and "Test Connection" buttons should work without "API endpoint not found" errors.