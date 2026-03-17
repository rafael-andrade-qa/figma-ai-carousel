import { Request, Response } from "express";

import { getUserTransactions } from "../services/credits.service";

export async function getTransactions(req: Request, res: Response) {
  try {
    console.log("[BACKEND] GET /credits/transactions recebido");
    console.log("[BACKEND] query:", req.query);

    const userEmail = req.query.userEmail;

    if (!userEmail || typeof userEmail !== "string") {
      return res.status(400).json({
        error: "userEmail é obrigatório",
      });
    }

    const transactions = getUserTransactions(userEmail);

    return res.json({
      email: userEmail.trim().toLowerCase(),
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