import { Request, Response } from "express";
import {
  consumeUserCredits,
  ensureUserCredits,
  getCreditsCost,
  refundUserCredits,
} from "../services/credits.service";

import { generateCarousel } from "../services/carousel.service";

export async function postGenerate(req: Request, res: Response) {
  try {
    console.log("[BACKEND] POST /generate recebido");
    console.log("[BACKEND] body:", req.body);
    console.log("[BACKEND] user:", req.user);

    if (!req.user) {
      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const { prompt, cards } = req.body as {
      prompt?: string;
      cards?: number;
    };

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Prompt é obrigatório",
      });
    }

    const totalCards =
      typeof cards === "number" && cards > 0 && cards <= 10 ? cards : 5;

    const userEmail = req.user.email;
    const user = await ensureUserCredits(userEmail);
    const creditsCost = getCreditsCost(totalCards);

    console.log(
      `[BACKEND] Usuário ${user.email} possui ${user.credits} créditos. Custo desta geração: ${creditsCost}`
    );

    const consumeResult = await consumeUserCredits(userEmail, totalCards);

    if (!consumeResult.ok) {
      console.log(`[BACKEND] Usuário ${user.email} sem créditos suficientes`);

      return res.status(402).json({
        error: "NO_CREDITS",
      });
    }

    try {
      const result = await generateCarousel({
        prompt,
        cards: totalCards,
      });

      console.log(
        `[BACKEND] Geração concluída para ${user.email}. Saldo restante: ${consumeResult.creditsLeft}`
      );

      return res.json({
        ...result,
        creditsUsed: consumeResult.creditsUsed,
        creditsLeft: consumeResult.creditsLeft,
      });
    } catch (error) {
      await refundUserCredits(userEmail, consumeResult.creditsUsed);

      console.log(
        `[BACKEND] Falha na geração. Créditos estornados para ${user.email}`
      );

      throw error;
    }
  } catch (error) {
    console.error("[BACKEND] Erro na rota /generate:", error);

    return res.status(500).json({
      error: "Erro ao gerar carrossel",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}