import { Request, Response } from "express";
import {
  constructStripeEvent,
  createStripeCheckoutSession,
  handleStripeEvent,
} from "../services/billing.service";
import { logError, logInfo, logWarn } from "../lib/logger";

export async function postCreateCheckoutSession(req: Request, res: Response) {
  try {
    logInfo("POST /billing/checkout-sessions recebido", {
      path: req.path,
      method: req.method,
      body: req.body,
      user: req.user,
    });

    if (!req.user) {
      logWarn("POST /billing/checkout-sessions sem autenticação", {
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
      logWarn("POST /billing/checkout-sessions com packageId inválido", {
        appUserId: req.user.appUserId,
        body: req.body,
      });

      return res.status(400).json({
        error: "packageId é obrigatório",
      });
    }

    const result = await createStripeCheckoutSession({
      userId: req.user.appUserId,
      packageId,
    });

    logInfo("Checkout session criada com sucesso", {
      appUserId: req.user.appUserId,
      authUserId: req.user.authUserId,
      email: req.user.email,
      packageId,
      checkoutSessionId: result.checkoutSessionId,
      localCheckoutSessionId: result.localCheckoutSessionId,
    });

    return res.json(result);
  } catch (error) {
    logError("Erro na rota /billing/checkout-sessions", error, {
      path: req.path,
      method: req.method,
      user: req.user,
    });

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
    logInfo("POST /billing/webhooks/stripe recebido", {
      path: req.path,
      method: req.method,
    });

    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      logWarn("Webhook Stripe sem assinatura", {
        path: req.path,
        method: req.method,
      });

      return res.status(400).send("Missing stripe-signature header");
    }

    const rawBody = req.body as Buffer;

    if (!Buffer.isBuffer(rawBody)) {
      logWarn("Webhook Stripe com body inválido", {
        path: req.path,
        method: req.method,
      });

      return res.status(400).send("Invalid webhook body");
    }

    const event = constructStripeEvent(rawBody, signature);

    logInfo("Evento Stripe recebido", {
      stripeEventId: event.id,
      stripeEventType: event.type,
    });

    const result = await handleStripeEvent(event);

    logInfo("Webhook Stripe processado", {
      stripeEventId: event.id,
      stripeEventType: event.type,
      result,
    });

    return res.json(result);
  } catch (error) {
    logError("Erro no webhook Stripe", error, {
      path: req.path,
      method: req.method,
    });

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