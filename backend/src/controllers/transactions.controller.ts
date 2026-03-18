import { Request, Response } from "express";
import { logError, logInfo, logWarn } from "../lib/logger";

import { getUserTransactionsByUserId } from "../services/credits.service";

export async function getTransactions(req: Request, res: Response) {
  try {
    logInfo("GET /credits/transactions recebido", {
      path: req.path,
      method: req.method,
      user: req.user,
    });

    if (!req.user) {
      logWarn("GET /credits/transactions sem autenticação", {
        path: req.path,
        method: req.method,
      });

      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const transactions = await getUserTransactionsByUserId(req.user.appUserId);

    logInfo("Transações carregadas com sucesso", {
      appUserId: req.user.appUserId,
      authUserId: req.user.authUserId,
      email: req.user.email,
      transactionsCount: transactions.length,
    });

    return res.json({
      email: req.user.email,
      transactions,
    });
  } catch (error) {
    logError("Erro na rota /credits/transactions", error, {
      path: req.path,
      method: req.method,
      user: req.user,
    });

    return res.status(500).json({
      error: "Erro ao buscar transações",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}