import { Request, Response } from "express";

import { getUserCredits } from "../services/credits.service";

export async function getCredits(req: Request, res: Response) {
  try {
    const userEmail = req.query.userEmail;

    if (!userEmail || typeof userEmail !== "string") {
      return res.status(400).json({
        error: "userEmail é obrigatório",
      });
    }

    const user = getUserCredits(userEmail);

    return res.json({
      email: user.email,
      credits: user.credits,
    });
  } catch (error) {
    console.error("[BACKEND] Erro na rota /credits:", error);

    return res.status(500).json({
      error: "Erro ao buscar créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}