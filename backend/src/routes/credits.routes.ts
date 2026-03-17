import {
  getPurchasePackages,
  postPurchaseCredits,
} from "../controllers/purchase.controller";

import { Router } from "express";
import { getCredits } from "../controllers/credits.controller";
import { getTransactions } from "../controllers/transactions.controller";

const router = Router();

router.get("/", getCredits);
router.get("/transactions", getTransactions);
router.get("/purchase/packages", getPurchasePackages);
router.post("/purchase", postPurchaseCredits);

export default router;