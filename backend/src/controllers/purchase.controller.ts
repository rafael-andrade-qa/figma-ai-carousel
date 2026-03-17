import { Request, Response } from "express";
import { addUserCredits, getUserCredits } from "../services/credits.service";

const CREDIT_PACKAGES = {
  starter: { credits: 20, label: "Pacote Starter" },
  pro: { credits: 60, label: "Pacote Pro" },
  studio: { credits: 150, label: "Pacote Studio" },
} as const;

type PackageId = keyof typeof CREDIT_PACKAGES;

export async function postPurchaseCredits(req: Request, res: Response) {
  try {
    console.log("[BACKEND] POST /credits/purchase recebido");
    console.log("[BACKEND] body:", req.body);

    const { userEmail, packageId } = req.body as {
      userEmail?: string;
      packageId?: string;
    };

    if (!userEmail || typeof userEmail !== "string") {
      console.log("[BACKEND] userEmail inválido");
      return res.status(400).json({
        error: "userEmail é obrigatório",
      });
    }

    if (!packageId || typeof packageId !== "string") {
      console.log("[BACKEND] packageId inválido");
      return res.status(400).json({
        error: "packageId é obrigatório",
      });
    }

    if (!(packageId in CREDIT_PACKAGES)) {
      console.log("[BACKEND] pacote inválido:", packageId);
      return res.status(400).json({
        error: "Pacote inválido",
      });
    }

    const selectedPackage = CREDIT_PACKAGES[packageId as PackageId];

    console.log(
      `[BACKEND] Adicionando ${selectedPackage.credits} créditos para ${userEmail}`
    );

    addUserCredits(
      userEmail,
      selectedPackage.credits,
      `Compra de créditos - ${selectedPackage.label}`
    );

    const user = getUserCredits(userEmail);

    console.log(
      `[BACKEND] Novo saldo de ${user.email}: ${user.credits} créditos`
    );

    return res.json({
      email: user.email,
      credits: user.credits,
      purchasedCredits: selectedPackage.credits,
      packageId,
    });
  } catch (error) {
    console.error("[BACKEND] Erro na rota /credits/purchase:", error);

    return res.status(500).json({
      error: "Erro ao comprar créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}