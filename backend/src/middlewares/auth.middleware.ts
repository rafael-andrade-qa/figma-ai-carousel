import { NextFunction, Request, Response } from "express";
import {
  getOrCreateAuthenticatedAppUser,
  verifyAccessToken,
} from "../lib/supabase-auth";

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;

  if (!header || typeof header !== "string") {
    return null;
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token.trim();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken = getBearerToken(req);

    if (!accessToken) {
      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const verified = await verifyAccessToken(accessToken);
    const appUser = await getOrCreateAuthenticatedAppUser({
      authUserId: verified.authUserId,
      email: verified.email,
    });

    req.user = {
      appUserId: appUser.appUserId,
      authUserId: appUser.authUserId,
      email: appUser.email,
    };

    return next();
  } catch (error) {
    console.error("[BACKEND] Falha na autenticação:", error);

    const message = error instanceof Error ? error.message : "UNKNOWN_AUTH_ERROR";

    if (
      message === "AUTH_TOKEN_MISSING" ||
      message === "AUTH_INVALID_TOKEN" ||
      message === "AUTH_EMAIL_NOT_AVAILABLE"
    ) {
      return res.status(401).json({
        error: "AUTH_INVALID",
      });
    }

    return res.status(500).json({
      error: "AUTH_INTERNAL_ERROR",
      detail: message,
    });
  }
}