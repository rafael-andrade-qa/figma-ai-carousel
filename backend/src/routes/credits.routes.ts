import {
  getPurchasePackages,
  postPurchaseCredits,
} from "../controllers/purchase.controller";

import { Router } from "express";
import { getCredits } from "../controllers/credits.controller";
import { getTransactions } from "../controllers/transactions.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, getCredits);
router.get("/transactions", requireAuth, getTransactions);
router.get("/purchase/packages", getPurchasePackages);
router.post("/purchase", requireAuth, postPurchaseCredits);

export default router;