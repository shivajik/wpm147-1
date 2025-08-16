# Demo User Credentials

This document contains test user credentials for development and demonstration purposes.

## Available Demo Users

### 1. Demo User
- **Email**: `demo@wpmaintenance.com`
- **Password**: `demo123`
- **Name**: Demo User
- **Subscription**: Free Plan
- **Status**: Active

### 2. Admin User  
- **Email**: `admin@wpmaintenance.com`
- **Password**: `admin123`
- **Name**: Admin User
- **Subscription**: Free Plan
- **Status**: Active

## Using Demo Credentials

1. Navigate to the login page
2. Enter one of the email/password combinations above
3. Click "Sign In"
4. You'll be automatically redirected to the dashboard

## Testing Authentication

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@wpmaintenance.com", "password": "demo123"}'
```

### Registration Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123", "firstName": "Test", "lastName": "User"}'
```

## Database Status

- **Provider**: Replit PostgreSQL
- **Connection**: Active
- **Tables**: All required tables created
- **Users**: 4 demo users available
- **Authentication**: Fully functional with bcrypt password hashing

## Notes

- All passwords are hashed using bcrypt with 12 salt rounds
- JWT tokens have a 7-day expiration period
- User sessions are managed through the authentication middleware
- Registration automatically assigns users to the "free" subscription plan