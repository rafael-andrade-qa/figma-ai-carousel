import { Router } from "express";
import { getCredits } from "../controllers/credits.controller";
import { postPurchaseCredits } from "../controllers/purchase.controller";

const router = Router();

router.get("/credits", getCredits);
router.post("/credits/purchase", postPurchaseCredits);

export default router;