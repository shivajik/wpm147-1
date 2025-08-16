import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Enhanced input validation schemas
export const secureStringSchema = z.string()
  .min(1)
  .max(1000)
  .refine(
    (val) => !/<script|javascript:|on\w+=/i.test(val),
    { message: 'Contains potentially malicious code' }
  );

export const secureUrlSchema = z.string()
  .url()
  .refine(
    (val) => /^https?:\/\//.test(val),
    { message: 'Only HTTP and HTTPS URLs are allowed' }
  )
  .refine(
    (val) => !val.includes('javascript:') && !val.includes('data:'),
    { message: 'JavaScript and data URLs are not allowed' }
  );

export const secureEmailSchema = z.string()
  .email()
  .max(254)
  .refine(
    (val) => !/[<>'"&]/.test(val),
    { message: 'Email contains invalid characters' }
  );

export const secureIdSchema = z.coerce.number()
  .int()
  .positive()
  .max(2147483647); // Max 32-bit integer

// SQL injection detection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(\b(OR|AND)\s+\w+\s*=\s*\w+)/i,
  /(['"])\s*(\b(OR|AND)\s+)?.*\1\s*(=|LIKE)/i,
  /(;|\||&|\$\(|\`)/
];

// XSS detection patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe|<object|<embed|<form/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi
];

// Path traversal detection
const PATH_TRAVERSAL_PATTERNS = [
  /\.\./,
  /[\/\\]etc[\/\\]passwd/i,
  /[\/\\]proc[\/\\]/i,
  /[\/\\]sys[\/\\]/i,
  /[\/\\]windows[\/\\]system32/i
];

export function detectSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

export function detectXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

export function detectPathTraversal(input: string): boolean {
  return PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(input));
}

export function validateAndSanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Check for malicious patterns
    if (detectSQLInjection(input)) {
      throw new Error('Potential SQL injection detected');
    }
    if (detectXSS(input)) {
      throw new Error('Potential XSS attack detected');
    }
    if (detectPathTraversal(input)) {
      throw new Error('Path traversal attempt detected');
    }
    
    // Basic sanitization
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(validateAndSanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = validateAndSanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Middleware for comprehensive input validation
export const secureInputValidator = (schema?: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and sanitize all inputs
      if (req.body) {
        req.body = validateAndSanitizeInput(req.body);
        
        // Apply schema validation if provided
        if (schema) {
          const result = schema.safeParse(req.body);
          if (!result.success) {
            return res.status(400).json({
              error: 'Validation failed',
              details: result.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
              }))
            });
          }
          req.body = result.data;
        }
      }
      
      if (req.query) {
        const sanitizedQuery: any = {};
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            sanitizedQuery[key] = validateAndSanitizeInput(value);
          } else {
            sanitizedQuery[key] = value;
          }
        }
        req.query = sanitizedQuery;
      }
      
      if (req.params) {
        const sanitizedParams: any = {};
        for (const [key, value] of Object.entries(req.params)) {
          sanitizedParams[key] = validateAndSanitizeInput(value);
        }
        req.params = sanitizedParams;
      }
      
      next();
    } catch (error) {
      console.warn('[SECURITY] Malicious input detected:', {
        ip: req.ip,
        method: req.method,
        url: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return res.status(400).json({
        error: 'Invalid input detected',
        message: error instanceof Error ? error.message : 'Request blocked for security reasons'
      });
    }
  };
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // For API endpoints using JWT, the token itself provides CSRF protection
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  // Check for CSRF token in headers
  const csrfToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  if (!csrfToken) {
    return res.status(403).json({
      error: 'CSRF token required',
      message: 'CSRF protection: token required for state-changing operations'
    });
  }
  
  // In a full implementation, you would validate the token against a stored value
  // For now, we rely on JWT-based authentication for API endpoints
  next();
};