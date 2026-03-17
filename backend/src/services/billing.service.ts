import { addUserCredits, getUserCredits } from "./credits.service";

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
  userEmail: string;
  packageId: string;
}) {
  const selectedPackage = getCreditPackage(input.packageId);

  if (!selectedPackage) {
    throw new Error("INVALID_PACKAGE");
  }

  const user = await getUserCredits(input.userEmail);

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
  if (await hasProcessedStripeEvent(event.id)) {
    return {
      ok: true,
      duplicated: true,
    };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const stripeCheckoutSessionId = session.id;
    const userEmail = session.metadata?.userEmail;
    const packageId = session.metadata?.packageId;
    const credits = Number(session.metadata?.credits ?? 0);

    if (!stripeCheckoutSessionId || !userEmail || !packageId || !credits) {
      throw new Error("Evento checkout.session.completed sem metadata suficiente.");
    }

    const localCheckout = await findCheckoutByStripeSessionId(stripeCheckoutSessionId);

    if (!localCheckout) {
      throw new Error(
        `Checkout local não encontrado para a sessão ${stripeCheckoutSessionId}.`
      );
    }

    const alreadyGranted = await hasGrantedCreditsForStripeSession(
      stripeCheckoutSessionId
    );

    if (!alreadyGranted) {
      await addUserCredits(
        userEmail,
        credits,
        `Compra de créditos via Stripe - ${packageId}`,
        {
          sourceType: "stripe_checkout",
          sourceId: stripeCheckoutSessionId,
          metadata: {
            packageId,
            credits,
            stripeCheckoutSessionId,
          },
        }
      );
    }

    await markCheckoutStatus({
      stripeCheckoutSessionId,
      status: "paid",
      paymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
    });

    await markStripeEventProcessed(event);

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

    return {
      ok: true,
      duplicated: false,
      type: event.type,
    };
  }

  await markStripeEventProcessed(event);

  return {
    ok: true,
    duplicated: false,
    ignored: true,
    type: event.type,
  };
}