import { NextFunction, Request, Response } from "express";
import {
  getOrCreateAuthenticatedAppUser,
  verifyAccessToken,
} from "../lib/supabase-auth";
import { logError, logInfo, logWarn } from "../lib/logger";

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
      logWarn("AUTH_REQUIRED - bearer token ausente", {
        path: req.path,
        method: req.method,
      });

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

    logInfo("Usuário autenticado com sucesso", {
      path: req.path,
      method: req.method,
      appUserId: appUser.appUserId,
      authUserId: appUser.authUserId,
      email: appUser.email,
    });

    return next();
  } catch (error) {
    logError("Falha na autenticação", error, {
      path: req.path,
      method: req.method,
    });

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