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

    const { prompt, cards, userEmail } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    if (!userEmail || typeof userEmail !== "string") {
      return res.status(400).json({ error: "Usuário é obrigatório" });
    }

    const totalCards =
      typeof cards === "number" && cards > 0 && cards <= 10 ? cards : 5;

    const user = ensureUserCredits(userEmail);
    const creditsCost = getCreditsCost(totalCards);

    console.log(
      `[BACKEND] Usuário ${user.email} possui ${user.credits} créditos. Custo desta geração: ${creditsCost}`
    );

    const consumeResult = consumeUserCredits(userEmail, totalCards);

    if (!consumeResult.ok) {
      return res.status(402).json({
        error: "NO_CREDITS",
      });
    }

    try {
      const result = await generateCarousel({
        prompt,
        cards: totalCards,
      });

      return res.json({
        ...result,
        creditsUsed: consumeResult.creditsUsed,
        creditsLeft: consumeResult.creditsLeft,
      });
    } catch (error) {
      refundUserCredits(userEmail, consumeResult.creditsUsed);

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