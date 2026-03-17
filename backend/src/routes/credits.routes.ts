import { Router } from "express";
import { getCredits } from "../controllers/credits.controller";
import { getTransactions } from "../controllers/transactions.controller";
import { postPurchaseCredits } from "../controllers/purchase.controller";

const router = Router();

router.get("/credits", getCredits);
router.get("/credits/transactions", getTransactions);
router.post("/credits/purchase", postPurchaseCredits);

export default router;