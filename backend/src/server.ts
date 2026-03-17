import "dotenv/config";

import billingRoutes from "./routes/billing.routes";
import cors from "cors";
import creditsRoutes from "./routes/credits.routes";
import dotenv from "dotenv";
import express from "express";
import generateRoutes from "./routes/generate.routes";
import { postStripeWebhook } from "./controllers/billing.controller";

dotenv.config();

const app = express();

app.use(cors());

app.post(
  "/billing/webhooks/stripe",
  express.raw({ type: "application/json" }),
  postStripeWebhook
);

app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({ ok: true });
});

app.use("/credits", creditsRoutes);
app.use("/billing", billingRoutes);
app.use("/", generateRoutes);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});