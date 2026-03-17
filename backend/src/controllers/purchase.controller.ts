import { Request, Response } from "express";
import { addUserCredits, getUserCredits } from "../services/credits.service";
import { getCreditPackage, listCreditPackages } from "../config/credit-packages";

export async function getPurchasePackages(_req: Request, res: Response) {
  try {
    return res.json({
      packages: listCreditPackages(),
    });
  } catch (error) {
    console.error("[BACKEND] Erro na rota GET /credits/purchase/packages:", error);

    return res.status(500).json({
      error: "Erro ao buscar pacotes de créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

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

    const selectedPackage = getCreditPackage(packageId);

    if (!selectedPackage) {
      console.log("[BACKEND] pacote inválido:", packageId);
      return res.status(400).json({
        error: "Pacote inválido",
      });
    }

    console.log(
      `[BACKEND] Adicionando ${selectedPackage.credits} créditos para ${userEmail}`
    );

    await addUserCredits(
      userEmail,
      selectedPackage.credits,
      `Compra de créditos - ${selectedPackage.label}`
    );

    const user = await getUserCredits(userEmail);

    console.log(
      `[BACKEND] Novo saldo de ${user.email}: ${user.credits} créditos`
    );

    return res.json({
      email: user.email,
      credits: user.credits,
      purchasedCredits: selectedPackage.credits,
      packageId: selectedPackage.id,
    });
  } catch (error) {
    console.error("[BACKEND] Erro na rota /credits/purchase:", error);

    return res.status(500).json({
      error: "Erro ao comprar créditos",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}