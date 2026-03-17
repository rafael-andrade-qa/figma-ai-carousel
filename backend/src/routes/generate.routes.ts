import { Router } from "express";
import { postGenerate } from "../controllers/generate.controller";

const router = Router();

router.post("/", postGenerate);

export default router;