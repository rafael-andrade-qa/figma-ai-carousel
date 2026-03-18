import { Request, Response } from "express";
import {
  addUserCreditsByUserId,
  getUserCreditsByUserId,
} from "../services/credits.service";
import {
  authRequired,
  invalidInput,
  invalidPackage,
  sendAppError,
  toAppError,
} from "../lib/app-error";
import { getCreditPackage, listCreditPackages } from "../config/credit-packages";
import { logError, logInfo, logWarn } from "../lib/logger";

export async function getPurchasePackages(_req: Request, res: Response) {
  try {
    return res.json({
      packages: listCreditPackages(),
    });
  } catch (error) {
    logError("Erro na rota GET /credits/purchase/packages", error);

    return sendAppError(
      res,
      toAppError(error, {
        code: "INTERNAL_ERROR",
        message: "Não foi possível buscar os pacotes de créditos.",
        status: 500,
      })
    );
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

      return sendAppError(res, authRequired());
    }

    const { packageId } = req.body as {
      packageId?: string;
    };

    if (!packageId || typeof packageId !== "string") {
      logWarn("POST /credits/purchase com packageId inválido", {
        appUserId: req.user.appUserId,
        body: req.body,
      });

      return sendAppError(res, invalidInput("packageId é obrigatório."));
    }

    const selectedPackage = getCreditPackage(packageId);

    if (!selectedPackage) {
      logWarn("POST /credits/purchase com pacote inválido", {
        appUserId: req.user.appUserId,
        packageId,
      });

      return sendAppError(res, invalidPackage(packageId));
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

    return sendAppError(
      res,
      toAppError(error, {
        code: "BILLING_FAILED",
        message: "Não foi possível concluir a compra de créditos.",
        status: 500,
      })
    );
  }
}