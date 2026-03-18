import { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/app-error";
import { logWarn } from "../lib/logger";
import { sendAppError } from "../lib/app-error";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type CreateRateLimitMiddlewareInput = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
};

const buckets = new Map<string, RateLimitBucket>();

function getClientIp(req: Request) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return req.ip || "unknown";
}

export function createRateLimitMiddleware({
  windowMs,
  maxRequests,
  keyPrefix,
}: CreateRateLimitMiddlewareInput) {
  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const now = Date.now();
    const clientIp = getClientIp(req);
    const key = `${keyPrefix}:${clientIp}`;

    const current = buckets.get(key);

    if (!current || now >= current.resetAt) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      return next();
    }

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);

      res.setHeader("Retry-After", String(retryAfterSeconds));

      logWarn("Rate limit excedido", {
        path: req.path,
        method: req.method,
        clientIp,
        keyPrefix,
        maxRequests,
        windowMs,
        retryAfterSeconds,
      });

      return sendAppError(
        res,
        new AppError({
          code: "INVALID_INPUT",
          message: "Muitas requisições em sequência. Tente novamente em instantes.",
          status: 429,
          detail: `rate_limit:${keyPrefix}`,
        })
      );
    }

    current.count += 1;
    buckets.set(key, current);

    return next();
  };
}