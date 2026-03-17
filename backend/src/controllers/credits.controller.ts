import { Request, Response } from "express";

import { getUserCredits } from "../services/credits.service";

export async function getCredits(req: Request, res: Response) {
  try {
    console.log("[BACKEND] GET /credits recebido");
    console.log("[BACKEND] query:", req.query);

    const userEmail = req.query.userEmail;

    if (!userEmail || typeof userEmail !== "string") {
      console.log("[BACKEND] userEmail inválido");
      return res.status(400).json({
        error: "userEmail é obrigatório",
      });
    }

    console.log(`[BACKEND] Buscando créditos do usuário ${userEmail}`);

    const user = getUserCredits(userEmail);

    console.log(
      `[BACKEND] Créditos encontrados para ${user.email}: ${user.credits}`
    );

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