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
      console.log("[BACKEND] prompt inválido");
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    if (!userEmail || typeof userEmail !== "string") {
      console.log("[BACKEND] userEmail inválido");
      return res.status(400).json({ error: "Usuário é obrigatório" });
    }

    const totalCards =
      typeof cards === "number" && cards > 0 && cards <= 10 ? cards : 5;

    console.log(
      `[BACKEND] Parâmetros validados. userEmail=${userEmail}, cards=${totalCards}`
    );

    const user = ensureUserCredits(userEmail);
    const creditsCost = getCreditsCost(totalCards);

    console.log(
      `[BACKEND] Usuário ${user.email} possui ${user.credits} créditos. Custo desta geração: ${creditsCost}`
    );

    const consumeResult = consumeUserCredits(userEmail, totalCards);

    if (!consumeResult.ok) {
      console.log(
        `[BACKEND] Usuário ${userEmail} sem créditos suficientes para gerar ${totalCards} cards`
      );

      return res.status(402).json({
        error: "NO_CREDITS",
      });
    }

    console.log(
      `[BACKEND] Créditos consumidos com sucesso. Usados: ${consumeResult.creditsUsed}. Restantes: ${consumeResult.creditsLeft}`
    );

    try {
      console.log("[BACKEND] Iniciando geração do carrossel");

      const result = await generateCarousel({
        prompt,
        cards: totalCards,
      });

      console.log("[BACKEND] Carrossel gerado com sucesso");

      return res.json({
        ...result,
        creditsUsed: consumeResult.creditsUsed,
        creditsLeft: consumeResult.creditsLeft,
      });
    } catch (error) {
      console.error(
        "[BACKEND] Erro durante a geração. Estornando créditos:",
        error
      );

      refundUserCredits(userEmail, consumeResult.creditsUsed);

      console.log(
        `[BACKEND] Créditos estornados para ${userEmail}: ${consumeResult.creditsUsed}`
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