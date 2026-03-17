import { Router } from "express";
import { postGenerate } from "../controllers/generate.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/generate", requireAuth, postGenerate);

export default router;