import { Router } from "express";
import { postGenerate } from "../controllers/generate.controller";

const router = Router();

router.post("/generate", postGenerate);

export default router;