import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import type { RegisterUser, LoginUser } from '@shared/schema';
import { EmailService } from './email-service.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set and at least 32 characters long in production');
  }
  // Development fallback - generate a secure random key
  const devSecret = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  WARNING: Using auto-generated JWT secret in development. Set JWT_SECRET environment variable for production!');
  return devSecret;
})();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: { id: number; email: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  static verifyToken(token: string): { id: number; email: string } | null {
    try {
      return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    } catch {
      return null;
    }
  }

  static async register(userData: RegisterUser) {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user with free plan
    const newUser = await storage.createUser({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      subscriptionPlan: 'free',
      subscriptionStatus: 'active',
    });

    // Send welcome email (don't wait for it, just fire and forget)
    EmailService.sendWelcomeEmail(newUser.email, newUser.firstName || 'User')
      .then(sent => {
        if (sent) {
          console.log(`Welcome email sent to ${newUser.email}`);
        } else {
          console.error(`Failed to send welcome email to ${newUser.email}`);
        }
      })
      .catch(error => {
        console.error('Error sending welcome email:', error);
      });

    // Generate token
    const token = this.generateToken({ id: newUser.id, email: newUser.email });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      token,
    };
  }

  static async login(userData: LoginUser) {
    try {
      // Find user
      const user = await storage.getUserByEmail(userData.email);
      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(userData.password, user.password);
      if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
      }

      // Generate token
      const token = this.generateToken({ id: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      };
    } catch (error) {
      // Log the actual error for debugging
      console.error('Login error details:', error);
      // Re-throw to be handled by the route handler
      throw error;
    }
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('INVALID_CURRENT_PASSWORD');
    }

    // Hash new password
    const hashedNewPassword = await this.hashPassword(newPassword);

    // Update password in database
    await storage.updateUserProfile(userId, { password: hashedNewPassword });
  }

  static async forgotPassword(email: string): Promise<boolean> {
    // Check if user exists
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal that user doesn't exist for security reasons
      // Return true to prevent email enumeration attacks
      return true;
    }

    // Generate reset token (random string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiry to 1 hour from now
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Save reset token to database
    await storage.setPasswordResetToken(email, resetToken, expires);

    // Send password reset email
    const emailSent = await EmailService.sendPasswordResetEmail(
      user.email, 
      user.firstName || 'User', 
      resetToken
    );

    if (emailSent) {
      console.log(`Password reset email sent to ${email}`);
    } else {
      console.error(`Failed to send password reset email to ${email}`);
    }

    return emailSent;
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Find user by reset token (token must not be expired)
    const user = await storage.getUserByResetToken(token);
    if (!user) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user's password
    await storage.updateUserProfile(user.id, { password: hashedPassword });

    // Clear the reset token
    await storage.clearPasswordResetToken(user.id);

    console.log(`Password reset successful for user ${user.email}`);
    return true;
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = AuthService.verifyToken(token);
    if (!decoded || !decoded.id || isNaN(decoded.id)) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get full user data
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};