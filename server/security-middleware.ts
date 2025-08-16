import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

// Rate limiting configuration
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again in 15 minutes.'
);

export const apiRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests per window
);

export const generalRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000 // 1000 requests per window
);

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or Postman) - common in development
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000',
      'https://aio-webcare.vercel.app',
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      // Add Replit-specific URLs
      process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : undefined,
      // Add development patterns
      /^https:\/\/.*\.replit\.dev$/,
      /^https:\/\/.*\.repl\.co$/
    ].filter(Boolean);

    // Check string origins
    const stringOrigins = allowedOrigins.filter(o => typeof o === 'string') as string[];
    const regexOrigins = allowedOrigins.filter(o => o instanceof RegExp) as RegExp[];
    
    const isAllowed = stringOrigins.includes(origin) || 
                     regexOrigins.some(regex => regex.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CORS] Allowing origin in development: ${origin}`);
        callback(null, true);
      } else {
        console.error(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'), false);
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://vercel.live",
        "https://analytics.google.com",
        "https://googletagmanager.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline styles
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:" // Allow external images for website thumbnails
      ],
      connectSrc: [
        "'self'",
        "https://api.url2png.com",
        "https://screenshotone.com",
        "https://api.screenshotone.com",
        "https://vercel.live",
        "wss://vercel.live"
      ],
      frameSrc: [
        "'self'",
        "https://vercel.live"
      ]
    },
  } : false, // Disable CSP in development for Vite
  crossOriginEmbedderPolicy: false, // Required for some external services
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false // Disable HSTS in development
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Basic XSS prevention - remove script tags and javascript: protocols
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Security audit logging middleware
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.(php|asp|jsp)$/i,
    /(union|select|insert|delete|update|drop|create|alter)/i,
    /<script|javascript:|on\w+=/i,
    /\.\./,
    /\/etc\/passwd/i,
    /wp-admin|wp-login/i
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.url) || pattern.test(req.body ? JSON.stringify(req.body) : '')
  );

  if (isSuspicious) {
    console.warn(`[SECURITY] Suspicious request detected:`, {
      ip,
      userAgent,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  }

  next();
};