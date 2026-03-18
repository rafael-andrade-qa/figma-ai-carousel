import { Request, Response } from "express";
import {
  authRequired,
  generationFailed,
  invalidInput,
  noCredits,
  sendAppError,
  toAppError,
} from "../lib/app-error";
import {
  consumeUserCreditsByUserId,
  ensureUserCreditsByUserId,
  getCreditsCost,
  refundUserCreditsByUserId,
} from "../services/credits.service";
import { createGenerationId, createRefundSourceId } from "../lib/ids";
import { logError, logInfo, logWarn } from "../lib/logger";

import { generateCarousel } from "../services/carousel.service";

export async function postGenerate(req: Request, res: Response) {
  const generationId = createGenerationId();

  try {
    logInfo("POST /generate recebido", {
      path: req.path,
      method: req.method,
      generationId,
      body: req.body,
      user: req.user,
    });

    if (!req.user) {
      logWarn("POST /generate sem autenticação", {
        path: req.path,
        method: req.method,
        generationId,
      });

      return sendAppError(res, authRequired());
    }

    const { prompt, cards } = req.body as {
      prompt?: string;
      cards?: number;
    };

    if (!prompt || typeof prompt !== "string") {
      logWarn("POST /generate com prompt inválido", {
        appUserId: req.user.appUserId,
        generationId,
        body: req.body,
      });

      return sendAppError(res, invalidInput("Prompt é obrigatório."));
    }

    const totalCards =
      typeof cards === "number" && cards > 0 && cards <= 10 ? cards : 5;

    const userId = req.user.appUserId;
    const user = await ensureUserCreditsByUserId(userId);
    const creditsCost = getCreditsCost(totalCards);

    logInfo("Validação de créditos antes da geração", {
      generationId,
      appUserId: req.user.appUserId,
      authUserId: req.user.authUserId,
      email: req.user.email,
      userCredits: user.credits,
      totalCards,
      creditsCost,
    });

    const consumeResult = await consumeUserCreditsByUserId(userId, totalCards, {
      sourceType: "generation",
      sourceId: generationId,
      description: `Consumo de créditos para geração ${generationId} com ${totalCards} cards`,
      metadata: {
        generationId,
        promptLength: prompt.length,
        cards: totalCards,
        creditsCost,
      },
    });

    if (!consumeResult.ok) {
      logWarn("Usuário sem créditos suficientes para geração", {
        generationId,
        appUserId: req.user.appUserId,
        authUserId: req.user.authUserId,
        email: req.user.email,
        totalCards,
        creditsCost,
      });

      return sendAppError(res, noCredits());
    }

    try {
        const result = await generateCarousel({
          prompt,
          cards: totalCards,
          generationId,
          appUserId: req.user.appUserId,
          authUserId: req.user.authUserId,
          userEmail: req.user.email,
      });

      logInfo("Geração concluída com sucesso", {
        generationId,
        appUserId: req.user.appUserId,
        authUserId: req.user.authUserId,
        email: req.user.email,
        totalCards,
        creditsUsed: consumeResult.creditsUsed,
        creditsLeft: consumeResult.creditsLeft,
      });

      return res.json({
        ...result,
        generationId,
        creditsUsed: consumeResult.creditsUsed,
        creditsLeft: consumeResult.creditsLeft,
      });
    } catch (error) {
      await refundUserCreditsByUserId(userId, consumeResult.creditsUsed, {
        sourceType: "generation_refund",
        sourceId: createRefundSourceId(generationId),
        description: `Estorno da geração ${generationId}`,
        metadata: {
          generationId,
          refundedCredits: consumeResult.creditsUsed,
          cards: totalCards,
        },
      });

      logError("Falha na geração com estorno aplicado", error, {
        generationId,
        appUserId: req.user.appUserId,
        authUserId: req.user.authUserId,
        email: req.user.email,
        totalCards,
        refundedCredits: consumeResult.creditsUsed,
      });

      return sendAppError(
        res,
        generationFailed(error instanceof Error ? error.message : "Erro desconhecido")
      );
    }
  } catch (error) {
    logError("Erro na rota /generate", error, {
      path: req.path,
      method: req.method,
      generationId,
      user: req.user,
    });

    return sendAppError(
      res,
      toAppError(error, {
        code: "GENERATION_FAILED",
        message: "Não foi possível gerar o carrossel.",
        status: 500,
      })
    );
  }
}