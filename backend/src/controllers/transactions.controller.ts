import { Request, Response } from "express";

import { getUserTransactions } from "../services/credits.service";

export async function getTransactions(req: Request, res: Response) {
  try {
    console.log("[BACKEND] GET /credits/transactions recebido");
    console.log("[BACKEND] user:", req.user);

    if (!req.user) {
      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const transactions = await getUserTransactions(req.user.email);

    return res.json({
      email: req.user.email,
      transactions,
    });
  } catch (error) {
    console.error("[BACKEND] Erro na rota /credits/transactions:", error);

    return res.status(500).json({
      error: "Erro ao buscar transações",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}