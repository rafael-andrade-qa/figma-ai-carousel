import { Request, Response } from "express";

import { getUserCredits } from "../services/credits.service";

export async function getCredits(req: Request, res: Response) {
  try {
    console.log("[BACKEND] GET /credits recebido");
    console.log("[BACKEND] user:", req.user);

    if (!req.user) {
      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const user = await getUserCredits(req.user.email);

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