import { Request, Response } from "express";
import { authRequired, sendAppError, toAppError } from "../lib/app-error";
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

      return sendAppError(res, authRequired());
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

    return sendAppError(
      res,
      toAppError(error, {
        code: "INTERNAL_ERROR",
        message: "Não foi possível buscar as transações do usuário.",
        status: 500,
      })
    );
  }
}