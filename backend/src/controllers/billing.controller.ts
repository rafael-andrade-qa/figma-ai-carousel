import { Request, Response } from "express";
import {
  constructStripeEvent,
  createStripeCheckoutSession,
  handleStripeEvent,
} from "../services/billing.service";

export async function postCreateCheckoutSession(req: Request, res: Response) {
  try {
    console.log("[BACKEND] POST /billing/checkout-sessions recebido");
    console.log("[BACKEND] body:", req.body);

    const { userEmail, packageId } = req.body as {
      userEmail?: string;
      packageId?: string;
    };

    if (!userEmail || typeof userEmail !== "string") {
      return res.status(400).json({
        error: "userEmail é obrigatório",
      });
    }

    if (!packageId || typeof packageId !== "string") {
      return res.status(400).json({
        error: "packageId é obrigatório",
      });
    }

    const result = await createStripeCheckoutSession({
      userEmail,
      packageId,
    });

    return res.json(result);
  } catch (error) {
    console.error("[BACKEND] Erro na rota /billing/checkout-sessions:", error);

    if (error instanceof Error && error.message === "INVALID_PACKAGE") {
      return res.status(400).json({
        error: "Pacote inválido",
      });
    }

    return res.status(500).json({
      error: "Erro ao criar sessão de checkout",
      detail: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}

export async function postStripeWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      return res.status(400).send("Missing stripe-signature header");
    }

    const rawBody = req.body as Buffer;
    const event = constructStripeEvent(rawBody, signature);

    const result = await handleStripeEvent(event);

    return res.json(result);
  } catch (error) {
    console.error("[BACKEND] Erro no webhook Stripe:", error);

    return res.status(400).send(
      error instanceof Error ? error.message : "Webhook error"
    );
  }
}

export function getBillingSuccess(_req: Request, res: Response) {
  return res
    .status(200)
    .send("Pagamento concluído. Você já pode voltar ao plugin.");
}

export function getBillingCancel(_req: Request, res: Response) {
  return res
    .status(200)
    .send("Pagamento cancelado. Você pode fechar esta página.");
}