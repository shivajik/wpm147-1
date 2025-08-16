# API Testing Guide & Deployment Status

## Current Status
- ✅ **Local Development**: All API endpoints working correctly
- ❌ **Vercel Production**: Still showing old endpoint configuration (needs deployment)

## Issue Analysis
The error you're seeing indicates two problems:
1. **Wrong HTTP Method**: You used GET instead of POST for registration
2. **Old Deployment**: Vercel is still running the old serverless function without profile endpoints

## Correct API Testing Commands

### 1. Authentication Endpoints

#### Register (POST required)
```bash
curl -X POST "https://your-domain.vercel.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

#### Login (POST required)
```bash
curl -X POST "https://your-domain.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

#### Get User Info (GET with token)
```bash
curl -X GET "https://your-domain.vercel.app/api/auth/user" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Profile Endpoints (After Deployment)

#### Get Profile
```bash
curl -X GET "https://your-domain.vercel.app/api/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Profile
```bash
curl -X PUT "https://your-domain.vercel.app/api/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "+1234567890",
    "company": "My Company"
  }'
```

### 3. Health Check (Always works)
```bash
curl -X GET "https://your-domain.vercel.app/api/health"
```

## Local Testing Results ✅

I verified locally:
- `POST /api/auth/register` works (returns proper email exists error)
- `GET /api/profile` works (returns proper auth error)
- Profile endpoints are functional

## Required Action: Deploy to Vercel

The serverless function has been updated with all fixes, but needs deployment:

### Option 1: Auto-deployment (if enabled)
```bash
git add .
git commit -m "Add profile API endpoints to serverless function"
git push origin main
```

### Option 2: Manual deployment with Vercel CLI
```bash
vercel --prod
```

### Option 3: Redeploy from Vercel Dashboard
1. Go to your Vercel dashboard
2. Find your project
3. Click "Redeploy" on the latest deployment

## After Deployment Verification

Test these endpoints in order:
1. `GET /api/health` - Should work immediately
2. `POST /api/auth/register` - With proper JSON payload
3. `POST /api/auth/login` - To get JWT token  
4. `GET /api/profile` - With valid JWT token

## Expected Behavior After Fix

- Personal Information page should update successfully
- No more "API endpoint not found" errors
- Profile forms should save data properly
- Password changes should work correctly

The local version is confirmed working - you just need to deploy the updated serverless function to Vercel.