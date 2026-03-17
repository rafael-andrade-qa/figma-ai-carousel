import {
  getBillingCancel,
  getBillingSuccess,
  postCreateCheckoutSession,
} from "../controllers/billing.controller";

import { Router } from "express";

const router = Router();

router.post("/checkout-sessions", postCreateCheckoutSession);
router.get("/success", getBillingSuccess);
router.get("/cancel", getBillingCancel);

export default router;