import { Request, Response } from "express";
import { logError, logInfo, logWarn } from "../lib/logger";

import { getUserCreditsByUserId } from "../services/credits.service";

export async function getCredits(req: Request, res: Response) {
  try {
    logInfo("GET /credits recebido", {
      path: req.path,
      method: req.method,
      user: req.user,
    });

    if (!req.user) {
      logWarn("GET /credits sem autenticação", {
        path: req.path,
        method: req.method,
      });

      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const user = await getUserCreditsByUserId(req.user.appUserId);

    logInfo("Créditos carregados com sucesso", {
      appUserId: req.user.appUserId,
      authUserId: req.user.authUserId,
      email: req.user.email,
      credits: user.credits,
    });

    return res.json({
      email: user.email,
      credits: user.credits,
    });
  } catch (error) {
    logError("Erro na rota /credits", error, {
      path: req.path,
      method: req.method,
      user: req.user,
    });

    return res.status(500).json({
      error: "Erro ao buscar créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}