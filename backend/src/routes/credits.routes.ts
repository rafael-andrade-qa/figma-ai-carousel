import { Router } from "express";
import { getCredits } from "../controllers/credits.controller";

const router = Router();

router.get("/credits", getCredits);

export default router;