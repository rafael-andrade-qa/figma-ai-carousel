import { Request, Response } from "express";

import { generateCarousel } from "../services/carousel.service";

export async function postGenerate(req: Request, res: Response) {
  try {
    console.log("[BACKEND] POST /generate recebido");
    console.log("[BACKEND] body:", req.body);

    const { prompt, cards } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    const totalCards =
      typeof cards === "number" && cards > 0 && cards <= 10 ? cards : 5;

    const result = await generateCarousel({
      prompt,
      cards: totalCards,
    });

    return res.json(result);
  } catch (error) {
    console.error("[BACKEND] Erro na rota /generate:", error);

    return res.status(500).json({
      error: "Erro ao gerar carrossel",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}