import "dotenv/config";

import { logInfo, logWarn } from "./lib/logger";

import billingRoutes from "./routes/billing.routes";
import cors from "cors";
import { createRateLimitMiddleware } from "./middlewares/rate-limit.middleware";
import creditsRoutes from "./routes/credits.routes";
import dotenv from "dotenv";
import express from "express";
import generateRoutes from "./routes/generate.routes";
import { postStripeWebhook } from "./controllers/billing.controller";

dotenv.config();

function parseAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]) {
  const allowNullOrigin = process.env.CORS_ALLOW_NULL_ORIGIN === "true";

  if (!origin) {
    return true;
  }

  if (origin === "null") {
    return allowNullOrigin;
  }

  if (allowedOrigins.length === 0) {
    return (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("https://localhost:") ||
      (allowNullOrigin && origin === "null")
    );
  }

  return allowedOrigins.includes(origin);
}

const app = express();
const allowedOrigins = parseAllowedOrigins();

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      const allowed = isOriginAllowed(origin, allowedOrigins);

      if (!allowed) {
        logWarn("CORS bloqueado para origin não permitida", {
          origin,
          allowedOrigins,
          allowNullOrigin: process.env.CORS_ALLOW_NULL_ORIGIN === "true",
        });

        callback(new Error("Not allowed by CORS"));
        return;
      }

      callback(null, true);
    },
    credentials: false,
  })
);

const generalRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  maxRequests: 120,
  keyPrefix: "general",
});

const generateRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  maxRequests: 12,
  keyPrefix: "generate",
});

const billingRateLimit = createRateLimitMiddleware({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyPrefix: "billing",
});

app.post(
  "/billing/webhooks/stripe",
  express.raw({ type: "application/json", limit: "2mb" }),
  postStripeWebhook
);

app.use(express.json({ limit: "10mb" }));
app.use(generalRateLimit);

app.get("/health", (_req, res) => {
  return res.json({
    ok: true,
    service: "figma-ai-carousel-backend",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/credits", creditsRoutes);
app.use("/billing", billingRateLimit, billingRoutes);
app.use("/", generateRateLimit, generateRoutes);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  logInfo("Servidor iniciado com sucesso", {
    port: PORT,
    env: process.env.NODE_ENV || "development",
    allowedOrigins,
    allowNullOrigin: process.env.CORS_ALLOW_NULL_ORIGIN === "true",
    healthUrl: `http://localhost:${PORT}/health`,
  });
});