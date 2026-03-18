import { Request, Response } from "express";
import {
  addUserCreditsByUserId,
  getUserCreditsByUserId,
} from "../services/credits.service";
import { getCreditPackage, listCreditPackages } from "../config/credit-packages";
import { logError, logInfo, logWarn } from "../lib/logger";

export async function getPurchasePackages(_req: Request, res: Response) {
  try {
    return res.json({
      packages: listCreditPackages(),
    });
  } catch (error) {
    logError("Erro na rota GET /credits/purchase/packages", error);

    return res.status(500).json({
      error: "Erro ao buscar pacotes de créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

export async function postPurchaseCredits(req: Request, res: Response) {
  try {
    logInfo("POST /credits/purchase recebido", {
      path: req.path,
      method: req.method,
      body: req.body,
      user: req.user,
    });

    if (!req.user) {
      logWarn("POST /credits/purchase sem autenticação", {
        path: req.path,
        method: req.method,
      });

      return res.status(401).json({
        error: "AUTH_REQUIRED",
      });
    }

    const { packageId } = req.body as {
      packageId?: string;
    };

    if (!packageId || typeof packageId !== "string") {
      logWarn("POST /credits/purchase com packageId inválido", {
        appUserId: req.user.appUserId,
        body: req.body,
      });

      return res.status(400).json({
        error: "packageId é obrigatório",
      });
    }

    const selectedPackage = getCreditPackage(packageId);

    if (!selectedPackage) {
      logWarn("POST /credits/purchase com pacote inválido", {
        appUserId: req.user.appUserId,
        packageId,
      });

      return res.status(400).json({
        error: "Pacote inválido",
      });
    }

    const userId = req.user.appUserId;

    logInfo("Adicionando créditos manualmente", {
      appUserId: req.user.appUserId,
      authUserId: req.user.authUserId,
      email: req.user.email,
      packageId: selectedPackage.id,
      creditsToAdd: selectedPackage.credits,
    });

    await addUserCreditsByUserId(
      userId,
      selectedPackage.credits,
      `Compra de créditos - ${selectedPackage.label}`
    );

    const user = await getUserCreditsByUserId(userId);

    logInfo("Compra manual concluída com sucesso", {
      appUserId: req.user.appUserId,
      authUserId: req.user.authUserId,
      email: req.user.email,
      packageId: selectedPackage.id,
      purchasedCredits: selectedPackage.credits,
      credits: user.credits,
    });

    return res.json({
      email: user.email,
      credits: user.credits,
      purchasedCredits: selectedPackage.credits,
      packageId: selectedPackage.id,
    });
  } catch (error) {
    logError("Erro na rota /credits/purchase", error, {
      path: req.path,
      method: req.method,
      user: req.user,
    });

    return res.status(500).json({
      error: "Erro ao comprar créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}