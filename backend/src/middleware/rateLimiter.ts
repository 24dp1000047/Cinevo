import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

export const rateLimiter = (maxRequests: number = 60, windowSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let record = requestCounts.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      requestCounts.set(ip, record);
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down and try again shortly.',
        },
      });
      return;
    }

    record.count++;
    next();
  };
};
