import {
  getBillingCancel,
  getBillingSuccess,
  postCreateCheckoutSession,
} from "../controllers/billing.controller";

import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/checkout-sessions", requireAuth, postCreateCheckoutSession);
router.get("/success", getBillingSuccess);
router.get("/cancel", getBillingCancel);

export default router;