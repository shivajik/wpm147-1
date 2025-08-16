# AIO Webcare - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Security Implementation](#security-implementation)
7. [Development Guidelines](#development-guidelines)
8. [Deployment Architecture](#deployment-architecture)
9. [Maintenance & Monitoring](#maintenance--monitoring)
10. [Performance Optimization](#performance-optimization)

## Project Overview

**AIO Webcare** is a comprehensive WordPress management platform designed for agencies and freelancers managing multiple WordPress websites. The platform provides centralized monitoring, security scanning, performance optimization, and detailed client reporting capabilities.

### Key Features
- **Multi-site Management**: Centralized dashboard for managing multiple WordPress websites
- **Security Monitoring**: Real-time malware detection, vulnerability scanning, and threat analysis
- **Performance Tracking**: PageSpeed monitoring, Core Web Vitals, and performance optimization
- **Client Reporting**: Professional PDF reports with detailed maintenance activities
- **SEO Analysis**: Comprehensive SEO tracking and optimization recommendations
- **Maintenance Automation**: Automated updates, backups, and maintenance tasks

### Business Value
- Reduces manual maintenance overhead by 70%
- Provides professional client reporting capabilities
- Centralized security monitoring for multiple sites
- Automated compliance and performance tracking

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄───┤   (Express.js)  │◄───┤   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External APIs │    │   Serverless    │    │   WordPress     │
│   (Security/SEO)│    │   Functions     │    │   Sites         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### Frontend Architecture
```typescript
// React 18 + TypeScript + Vite
src/
├── components/          // Reusable UI components
│   ├── ui/             // shadcn/ui components
│   ├── forms/          // Form components
│   ├── charts/         // Data visualization
│   └── reports/        // Report components
├── pages/              // Route components
├── hooks/              // Custom React hooks
├── lib/                // Utilities and configurations
└── types/              // TypeScript definitions
```

#### Backend Architecture
```typescript
// Express.js + TypeScript
server/
├── routes.ts           // API route definitions
├── auth.ts             // Authentication middleware
├── storage.ts          // Data access layer
├── security/           // Security scanning modules
├── pdf-report-generator.ts  // PDF generation
└── wp-remote-manager-client.ts  // WordPress integration
```

### Data Flow
1. **User Interaction**: Frontend components trigger API calls
2. **Authentication**: JWT token validation on protected routes
3. **Data Processing**: Backend services process requests
4. **External Integration**: WordPress sites and third-party APIs
5. **Database Operations**: Drizzle ORM handles data persistence
6. **Response**: JSON responses with real-time updates

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.6.3 | Type safety |
| Vite | 5.4.19 | Build tool & dev server |
| Tailwind CSS | 3.4.17 | Styling framework |
| shadcn/ui | Latest | Component library |
| TanStack Query | 5.60.5 | Server state management |
| React Hook Form | 7.55.0 | Form handling |
| Wouter | 3.3.5 | Routing |
| Framer Motion | 11.13.1 | Animations |
| Recharts | 2.15.2 | Data visualization |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.16.11 | Runtime environment |
| Express.js | 4.21.2 | Web framework |
| TypeScript | 5.6.3 | Type safety |
| Drizzle ORM | 0.39.1 | Database ORM |
| PostgreSQL | Latest | Primary database |
| JWT | 9.0.2 | Authentication |
| bcryptjs | 3.0.2 | Password hashing |

### External Services
| Service | Purpose | Integration |
|---------|---------|------------|
| Supabase | PostgreSQL hosting | Primary database |
| VirusTotal | Malware detection | Security scanning |
| WPScan | Vulnerability scanning | Security monitoring |
| SendGrid | Email delivery | Notifications |
| Vercel | Serverless functions | PDF generation |

## Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Clients Table
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Websites Table
```sql
CREATE TABLE websites (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  wp_admin_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',
  thumbnail_url VARCHAR(500),
  last_checked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Security Scans Table
```sql
CREATE TABLE security_scans (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id),
  scan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  threats_detected INTEGER DEFAULT 0,
  scan_details JSONB,
  scan_timestamp TIMESTAMP DEFAULT NOW()
);
```

#### Performance Scans Table
```sql
CREATE TABLE performance_scans (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id),
  pagespeed_score INTEGER,
  yslow_score INTEGER,
  load_time DECIMAL(10,3),
  core_web_vitals_grade VARCHAR(10),
  scan_timestamp TIMESTAMP DEFAULT NOW()
);
```

### Relationship Diagram
```
users (1) ──── (n) clients (1) ──── (n) websites
                                         │
                                         ├── (n) security_scans
                                         ├── (n) performance_scans
                                         ├── (n) seo_scans
                                         └── (n) maintenance_logs
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "jwt_token_here"
}
```

### Client Management Endpoints

#### GET /api/clients
Retrieve all clients for authenticated user.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0123",
      "company": "Acme Corp",
      "websiteCount": 3,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/clients
Create a new client.

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-0123",
  "company": "Acme Corp"
}
```

### Website Management Endpoints

#### GET /api/websites
Retrieve all websites for authenticated user.

**Query Parameters:**
- `clientId` (optional): Filter by client ID
- `status` (optional): Filter by status (active, inactive, suspended)

**Response:**
```json
{
  "websites": [
    {
      "id": 1,
      "name": "Acme Main Site",
      "url": "https://acme.com",
      "status": "active",
      "thumbnailUrl": "https://screenshots.com/acme.jpg",
      "lastChecked": "2024-01-15T10:30:00Z",
      "client": {
        "id": 1,
        "name": "Acme Corporation"
      }
    }
  ]
}
```

#### POST /api/websites
Add a new website to monitoring.

**Request Body:**
```json
{
  "clientId": 1,
  "name": "Acme Main Site",
  "url": "https://acme.com",
  "wpAdminUrl": "https://acme.com/wp-admin"
}
```

### Security Scanning Endpoints

#### POST /api/websites/:id/security-scan
Initiate security scan for a website.

**Response:**
```json
{
  "message": "Security scan initiated",
  "scanId": 123,
  "estimatedDuration": "2-5 minutes"
}
```

#### GET /api/websites/:id/security-scans
Retrieve security scan history.

**Response:**
```json
{
  "scans": [
    {
      "id": 123,
      "scanType": "comprehensive",
      "status": "completed",
      "threatsDetected": 0,
      "scanDetails": {
        "malware": "clean",
        "vulnerabilities": [],
        "blacklist": "clean"
      },
      "scanTimestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Performance Monitoring Endpoints

#### POST /api/websites/:id/performance-scan
Run performance analysis on a website.

**Response:**
```json
{
  "message": "Performance scan initiated",
  "scanId": 456,
  "estimatedDuration": "30-60 seconds"
}
```

#### GET /api/websites/:id/performance-scans
Retrieve performance scan history.

**Response:**
```json
{
  "scans": [
    {
      "id": 456,
      "pagespeedScore": 92,
      "yslowScore": 88,
      "loadTime": 1.234,
      "coreWebVitalsGrade": "A",
      "scanTimestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Client Reporting Endpoints

#### GET /api/client-reports
Retrieve all client reports.

**Response:**
```json
{
  "reports": [
    {
      "id": 1,
      "title": "Monthly Report - January 2024",
      "clientId": 1,
      "dateFrom": "2024-01-01",
      "dateTo": "2024-01-31",
      "status": "completed",
      "createdAt": "2024-02-01T09:00:00Z"
    }
  ]
}
```

#### POST /api/client-reports
Generate a new client report.

**Request Body:**
```json
{
  "title": "Monthly Report - February 2024",
  "clientId": 1,
  "dateFrom": "2024-02-01",
  "dateTo": "2024-02-29",
  "includeSecurityScans": true,
  "includePerformanceData": true,
  "includeSeoAnalysis": true
}
```

#### GET /api/client-reports/:id/pdf
Download report as PDF.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:** PDF file download

## Security Implementation

### Authentication & Authorization

#### JWT Token Security
```typescript
// Token generation
const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email 
    },
    JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'aio-webcare',
      audience: 'aio-webcare-users'
    }
  );
};

// Token validation middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded as { id: number; email: string };
    next();
  });
};
```

#### Password Security
```typescript
// Password hashing
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password validation
const validatePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### Data Validation
```typescript
// Input validation with Zod
const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100)
});

// API validation middleware
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors 
      });
    }
  };
};
```

### SQL Injection Prevention
```typescript
// Using Drizzle ORM with parameterized queries
const getWebsitesByUser = async (userId: number) => {
  return await db
    .select()
    .from(websites)
    .innerJoin(clients, eq(websites.clientId, clients.id))
    .where(eq(clients.userId, userId));
};
```

### CORS Configuration
```typescript
// CORS setup for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Development Guidelines

### Code Style & Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### ESLint Rules
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Component Development

#### React Component Pattern
```typescript
// Component structure
interface Props {
  title: string;
  data: DataType[];
  onAction: (id: number) => void;
}

export const ComponentName: React.FC<Props> = ({ 
  title, 
  data, 
  onAction 
}) => {
  // Hooks at the top
  const [loading, setLoading] = useState(false);
  const { data: apiData } = useQuery(['key'], fetchFn);

  // Event handlers
  const handleClick = useCallback((id: number) => {
    setLoading(true);
    onAction(id);
  }, [onAction]);

  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};
```

#### API Integration Pattern
```typescript
// Custom hook for API operations
export const useWebsites = () => {
  return useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await fetch('/api/websites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch websites');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

// Mutation for data updates
export const useCreateWebsite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateWebsiteData) => {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create website');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['websites']);
    }
  });
};
```

### Database Operations

#### Drizzle ORM Patterns
```typescript
// Schema definition
export const websites = pgTable('websites', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow()
});

// Complex queries
export const getWebsiteWithStats = async (websiteId: number) => {
  return await db
    .select({
      website: websites,
      client: clients,
      lastSecurityScan: {
        id: securityScans.id,
        status: securityScans.status,
        scanTimestamp: securityScans.scanTimestamp
      },
      lastPerformanceScan: {
        id: performanceScans.id,
        pagespeedScore: performanceScans.pagespeedScore,
        scanTimestamp: performanceScans.scanTimestamp
      }
    })
    .from(websites)
    .innerJoin(clients, eq(websites.clientId, clients.id))
    .leftJoin(securityScans, and(
      eq(securityScans.websiteId, websites.id),
      eq(securityScans.id, 
        db.select({ maxId: max(securityScans.id) })
          .from(securityScans)
          .where(eq(securityScans.websiteId, websites.id))
      )
    ))
    .leftJoin(performanceScans, and(
      eq(performanceScans.websiteId, websites.id),
      eq(performanceScans.id, 
        db.select({ maxId: max(performanceScans.id) })
          .from(performanceScans)
          .where(eq(performanceScans.websiteId, websites.id))
      )
    ))
    .where(eq(websites.id, websiteId))
    .limit(1);
};
```

## Deployment Architecture

### Production Environment

#### Vercel Deployment
```yaml
# vercel.json
{
  "version": 2,
  "functions": {
    "api/index.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Environment Variables
```bash
# Production environment variables
DATABASE_URL="postgresql://user:pass@host:port/db"
JWT_SECRET="your-production-jwt-secret"
SENDGRID_API_KEY="your-sendgrid-api-key"
VIRUSTOTAL_API_KEY="your-virustotal-api-key"
WPSCAN_API_TOKEN="your-wpscan-token"
FRONTEND_URL="https://your-domain.com"
```

#### Database Migration Strategy
```sql
-- Migration versioning
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Example migration
-- Migration: 001_add_security_scans_table.sql
CREATE TABLE security_scans (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
  scan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  threats_detected INTEGER DEFAULT 0,
  scan_details JSONB,
  scan_timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_security_scans_website_id ON security_scans(website_id);
CREATE INDEX idx_security_scans_timestamp ON security_scans(scan_timestamp);

INSERT INTO migrations (version, description) 
VALUES ('001', 'Add security scans table');
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Maintenance & Monitoring

### Health Monitoring
```typescript
// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      externalApis: 'unknown'
    }
  };

  try {
    // Database check
    await db.select().from(users).limit(1);
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }

  // External API checks
  try {
    // Check external services
    health.checks.externalApis = 'healthy';
  } catch (error) {
    health.checks.externalApis = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Error Handling & Logging
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service
  }

  res.status(500).json({
    message: 'Internal server error',
    requestId: req.headers['x-request-id']
  });
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = generateRequestId();
  req.headers['x-request-id'] = requestId;

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms [${requestId}]`);
  });

  next();
});
```

### Database Maintenance
```sql
-- Regular maintenance queries
-- 1. Clean up old security scans (keep last 100 per website)
DELETE FROM security_scans 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY website_id 
      ORDER BY scan_timestamp DESC
    ) as rn
    FROM security_scans
  ) ranked 
  WHERE rn <= 100
);

-- 2. Clean up old performance scans (keep last 100 per website)
DELETE FROM performance_scans 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY website_id 
      ORDER BY scan_timestamp DESC
    ) as rn
    FROM performance_scans
  ) ranked 
  WHERE rn <= 100
);

-- 3. Update statistics
ANALYZE;
VACUUM;
```

## Performance Optimization

### Frontend Optimization

#### Code Splitting
```typescript
// Lazy loading components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Router with Suspense
<Router>
  <Suspense fallback={<LoadingSkeleton />}>
    <Route path="/dashboard" component={Dashboard} />
    <Route path="/reports" component={Reports} />
    <Route path="/settings" component={Settings} />
  </Suspense>
</Router>
```

#### Caching Strategy
```typescript
// TanStack Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

// Prefetching critical data
const prefetchDashboardData = async () => {
  await queryClient.prefetchQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });
  
  await queryClient.prefetchQuery({
    queryKey: ['recent-websites'],
    queryFn: fetchRecentWebsites
  });
};
```

### Backend Optimization

#### Database Query Optimization
```typescript
// Efficient pagination
const getWebsitesPaginated = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  
  return await db
    .select({
      id: websites.id,
      name: websites.name,
      url: websites.url,
      status: websites.status,
      clientName: clients.name,
      lastScanDate: max(securityScans.scanTimestamp)
    })
    .from(websites)
    .innerJoin(clients, eq(websites.clientId, clients.id))
    .leftJoin(securityScans, eq(securityScans.websiteId, websites.id))
    .groupBy(websites.id, clients.name)
    .orderBy(desc(websites.createdAt))
    .limit(limit)
    .offset(offset);
};

// Connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

#### API Response Optimization
```typescript
// Response compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// ETag caching
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  }
  next();
});
```

### Monitoring & Analytics
```typescript
// Performance monitoring
const performanceMonitor = {
  trackApiRequest: (method: string, path: string, duration: number, status: number) => {
    // Send metrics to monitoring service
    console.log(`API: ${method} ${path} ${status} ${duration}ms`);
  },
  
  trackDatabaseQuery: (query: string, duration: number) => {
    if (duration > 1000) { // Log slow queries
      console.warn(`Slow query detected: ${query} (${duration}ms)`);
    }
  }
};
```

### Security Best Practices
1. **Input Validation**: All user inputs validated with Zod schemas
2. **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
3. **XSS Protection**: Content Security Policy headers
4. **CSRF Protection**: CSRF tokens for state-changing operations
5. **Rate Limiting**: API rate limits to prevent abuse
6. **Secure Headers**: Security headers via Helmet.js
7. **Environment Variables**: Sensitive data in environment variables
8. **Regular Updates**: Dependencies updated regularly
9. **Error Handling**: No sensitive information in error messages
10. **Logging**: Comprehensive logging without sensitive data

This technical documentation provides a comprehensive overview of the AIO Webcare system architecture, implementation details, and best practices for development and maintenance.