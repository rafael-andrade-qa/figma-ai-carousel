import {
  getBillingCancel,
  getBillingSuccess,
  postCreateCheckoutSession,
  postStripeWebhook,
} from "../controllers/billing.controller";

import { Router } from "express";

const router = Router();

router.post("/checkout-sessions", postCreateCheckoutSession);
router.get("/success", getBillingSuccess);
router.get("/cancel", getBillingCancel);
router.post("/webhooks/stripe", postStripeWebhook);

export default router;