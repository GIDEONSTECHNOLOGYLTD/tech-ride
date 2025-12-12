import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Per-user rate limiting middleware
 * Limits requests based on authenticated userId instead of IP
 */

// Store for tracking user request counts
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of userRequestCounts.entries()) {
    if (now > data.resetTime) {
      userRequestCounts.delete(userId);
    }
  }
}, 60 * 60 * 1000);

export const userRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.userId;
    
    // If no user (unauthenticated), skip this check (global rate limit still applies)
    if (!userId) {
      return next();
    }

    const now = Date.now();
    const userKey = userId.toString();
    const userData = userRequestCounts.get(userKey);

    if (!userData || now > userData.resetTime) {
      // First request or window expired
      userRequestCounts.set(userKey, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 60000} minutes.`,
        retryAfter: Math.ceil((userData.resetTime - now) / 1000),
      });
    }

    userData.count++;
    next();
  };
};

/**
 * Stricter rate limit for expensive operations
 */
export const strictUserRateLimit = userRateLimit(30, 15 * 60 * 1000); // 30 requests per 15 min

/**
 * Normal rate limit for regular operations
 */
export const normalUserRateLimit = userRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 min
