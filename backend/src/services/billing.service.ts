import { addUserCreditsByUserId, getUserCreditsByUserId } from "./credits.service";
import { logError, logInfo } from "../lib/logger";

import Stripe from "stripe";
import { getCreditPackage } from "../config/credit-packages";
import { stripe } from "../lib/stripe";
import { supabaseAdmin } from "../lib/supabase";

type CheckoutSessionRow = {
  id: string;
  user_id: string;
  package_id: string;
  credits: number;
  amount_cents: number;
  currency: string;
  status: "pending" | "paid" | "expired" | "failed" | "canceled";
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:3001";
}

function getWebhookSecret() {
  const value = process.env.STRIPE_WEBHOOK_SECRET;
  if (!value) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  }
  return value;
}

export async function createStripeCheckoutSession(input: {
  userId: string;
  packageId: string;
}) {
  const selectedPackage = getCreditPackage(input.packageId);

  if (!selectedPackage) {
    throw new Error("INVALID_PACKAGE");
  }

  const user = await getUserCreditsByUserId(input.userId);

  logInfo("Criando sessão local de checkout", {
    appUserId: user.id,
    email: user.email,
    packageId: selectedPackage.id,
    credits: selectedPackage.credits,
    amountCents: selectedPackage.amountCents,
    currency: selectedPackage.currency,
    flow: "stripe_checkout_create",
  });

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("checkout_sessions")
    .insert({
      user_id: user.id,
      provider: "stripe",
      package_id: selectedPackage.id,
      credits: selectedPackage.credits,
      amount_cents: selectedPackage.amountCents,
      currency: selectedPackage.currency,
      status: "pending",
      metadata: {
        userEmail: user.email,
        userId: user.id,
      },
    })
    .select(
      "id, user_id, package_id, credits, amount_cents, currency, status, stripe_checkout_session_id, stripe_payment_intent_id"
    )
    .single();

  if (insertError || !inserted) {
    throw new Error(
      `Erro ao criar sessão local de checkout: ${insertError?.message ?? "sem dados"}`
    );
  }

  const localCheckout = inserted as CheckoutSessionRow;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${getAppUrl()}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppUrl()}/billing/cancel`,
    client_reference_id: user.id,
    metadata: {
      internalCheckoutSessionId: localCheckout.id,
      userId: user.id,
      userEmail: user.email,
      packageId: selectedPackage.id,
      credits: String(selectedPackage.credits),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: selectedPackage.currency,
          unit_amount: selectedPackage.amountCents,
          product_data: {
            name: selectedPackage.label,
            description: `${selectedPackage.credits} créditos para o Figma AI Carousel`,
          },
        },
      },
    ],
  });

  const { error: updateError } = await supabaseAdmin
    .from("checkout_sessions")
    .update({
      stripe_checkout_session_id: checkoutSession.id,
    })
    .eq("id", localCheckout.id);

  if (updateError) {
    throw new Error(
      `Erro ao vincular checkout do Stripe: ${updateError.message}`
    );
  }

  logInfo("Checkout Stripe criado com sucesso", {
    appUserId: user.id,
    email: user.email,
    packageId: selectedPackage.id,
    stripeCheckoutSessionId: checkoutSession.id,
    localCheckoutSessionId: localCheckout.id,
    flow: "stripe_checkout_create",
  });

  return {
    checkoutUrl: checkoutSession.url,
    checkoutSessionId: checkoutSession.id,
    localCheckoutSessionId: localCheckout.id,
    package: selectedPackage,
  };
}

export function constructStripeEvent(rawBody: Buffer, signature: string) {
  return stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
}

async function hasProcessedStripeEvent(stripeEventId: string) {
  const { data, error } = await supabaseAdmin
    .from("stripe_events")
    .select("id")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao verificar evento Stripe: ${error.message}`);
  }

  return Boolean(data);
}

async function markStripeEventProcessed(event: Stripe.Event) {
  const { error } = await supabaseAdmin.from("stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event,
  });

  if (error) {
    throw new Error(`Erro ao registrar evento Stripe: ${error.message}`);
  }
}

async function markCheckoutStatus(input: {
  stripeCheckoutSessionId: string;
  status: "paid" | "expired" | "failed" | "canceled";
  paymentIntentId?: string | null;
}) {
  const updatePayload: Record<string, unknown> = {
    status: input.status,
  };

  if (input.paymentIntentId !== undefined) {
    updatePayload.stripe_payment_intent_id = input.paymentIntentId;
  }

  if (input.status === "paid") {
    updatePayload.paid_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("checkout_sessions")
    .update(updatePayload)
    .eq("stripe_checkout_session_id", input.stripeCheckoutSessionId);

  if (error) {
    throw new Error(`Erro ao atualizar checkout session: ${error.message}`);
  }
}

async function findCheckoutByStripeSessionId(stripeCheckoutSessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("checkout_sessions")
    .select(
      "id, user_id, package_id, credits, amount_cents, currency, status, stripe_checkout_session_id, stripe_payment_intent_id"
    )
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar checkout session: ${error.message}`);
  }

  return (data ?? null) as CheckoutSessionRow | null;
}

async function hasGrantedCreditsForStripeSession(stripeCheckoutSessionId: string) {
  const { data, error } = await supabaseAdmin
    .from("credit_transactions")
    .select("id")
    .eq("source_type", "stripe_checkout")
    .eq("source_id", stripeCheckoutSessionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Erro ao verificar crédito já concedido para a sessão Stripe: ${error.message}`
    );
  }

  return Boolean(data);
}

export async function handleStripeEvent(event: Stripe.Event) {
  logInfo("Iniciando processamento do evento Stripe", {
    stripeEventType: event.type,
    stripeEventId: event.id,
  });

  if (await hasProcessedStripeEvent(event.id)) {
    logInfo("Evento Stripe já processado", {
      stripeEventId: event.id,
      stripeEventType: event.type,
    });

    return {
      ok: true,
      duplicated: true,
    };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const stripeCheckoutSessionId = session.id;
    const packageId = session.metadata?.packageId;
    const credits = Number(session.metadata?.credits ?? 0);

    logInfo("checkout.session.completed recebido", {
      stripeCheckoutSessionId,
      packageId,
      credits,
      internalCheckoutSessionId: session.metadata?.internalCheckoutSessionId,
      metadataUserId: session.metadata?.userId,
      clientReferenceId: session.client_reference_id,
      flow: "stripe_webhook_completed",
    });

    if (!stripeCheckoutSessionId || !packageId || !credits) {
      throw new Error("Evento checkout.session.completed sem metadata suficiente.");
    }

    const localCheckout = await findCheckoutByStripeSessionId(stripeCheckoutSessionId);

    if (!localCheckout) {
      throw new Error(
        `Checkout local não encontrado para a sessão ${stripeCheckoutSessionId}.`
      );
    }

    logInfo("Checkout local encontrado para sessão Stripe", {
      stripeCheckoutSessionId,
      localCheckoutSessionId: localCheckout.id,
      appUserId: localCheckout.user_id,
      packageId: localCheckout.package_id,
      status: localCheckout.status,
      credits: localCheckout.credits,
      flow: "stripe_webhook_completed",
    });

    const alreadyGranted = await hasGrantedCreditsForStripeSession(
      stripeCheckoutSessionId
    );

    if (!alreadyGranted) {
      logInfo("Concedendo créditos da sessão Stripe", {
        stripeCheckoutSessionId,
        localCheckoutSessionId: localCheckout.id,
        appUserId: localCheckout.user_id,
        packageId,
        credits,
        flow: "stripe_credit_grant",
      });

      await addUserCreditsByUserId(
        localCheckout.user_id,
        credits,
        `Compra de créditos via Stripe - ${packageId}`,
        {
          sourceType: "stripe_checkout",
          sourceId: stripeCheckoutSessionId,
          metadata: {
            packageId,
            credits,
            stripeCheckoutSessionId,
            localCheckoutSessionId: localCheckout.id,
            userId: localCheckout.user_id,
          },
        }
      );
    } else {
      logInfo("Créditos da sessão Stripe já haviam sido concedidos", {
        stripeCheckoutSessionId,
        appUserId: localCheckout.user_id,
      });
    }

    await markCheckoutStatus({
      stripeCheckoutSessionId,
      status: "paid",
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    });

    logInfo("Checkout marcado como pago", {
      stripeCheckoutSessionId,
      localCheckoutSessionId: localCheckout.id,
      appUserId: localCheckout.user_id,
      flow: "stripe_checkout_paid",
    });

    await markStripeEventProcessed(event);

    logInfo("Evento Stripe registrado com sucesso", {
      stripeEventId: event.id,
      stripeEventType: event.type,
    });

    return {
      ok: true,
      duplicated: false,
      type: event.type,
    };
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    await markCheckoutStatus({
      stripeCheckoutSessionId: session.id,
      status: "expired",
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    });

    await markStripeEventProcessed(event);

    logInfo("Checkout expirado processado", {
      stripeEventId: event.id,
      stripeEventType: event.type,
      stripeCheckoutSessionId: session.id,
    });

    return {
      ok: true,
      duplicated: false,
      type: event.type,
    };
  }

  await markStripeEventProcessed(event);

  logInfo("Evento Stripe ignorado, mas registrado", {
    stripeEventId: event.id,
    stripeEventType: event.type,
  });

  return {
    ok: true,
    duplicated: false,
    ignored: true,
    type: event.type,
  };
}